import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

type QueueJob = {
  sessionKey: string;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  run: () => Promise<unknown>;
  createdAt: number;
  started: boolean;
  cancelled: boolean;
};

@Injectable()
export class ChatQueueService {
  private queue: QueueJob[] = [];
  private active = 0;
  private readonly activeSessions = new Set<string>();

  private get concurrency() {
    return Number(process.env.CHATBOT_QUEUE_CONCURRENCY ?? 2);
  }

  private get maxQueueSize() {
    return Number(process.env.CHATBOT_MAX_QUEUE_SIZE ?? 40);
  }

  private get maxQueueWaitMs() {
    return Number(process.env.CHATBOT_MAX_QUEUE_WAIT_MS ?? 45_000);
  }

  async enqueue<T>(sessionKey: string, run: () => Promise<T>): Promise<T> {
    if (this.activeSessions.has(sessionKey)) {
      throw new HttpException(
        {
          message:
            "A chatbot response is already being prepared. Please wait for it to finish.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (this.queue.length >= this.maxQueueSize) {
      throw new HttpException(
        {
          message:
            "The assistant is busy right now. Please try again shortly.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.activeSessions.add(sessionKey);

    return new Promise<T>((resolve, reject) => {
      const job: QueueJob = {
        sessionKey,
        resolve: (value: unknown) => resolve(value as T),
        reject,
        run: () => run() as Promise<unknown>,
        createdAt: Date.now(),
        started: false,
        cancelled: false,
      };

      const waitTimer = setTimeout(() => {
        if (!job.started) {
          job.cancelled = true;
          this.removeJob(job);
          this.activeSessions.delete(sessionKey);
          reject(
            new HttpException(
              {
                message:
                  "The assistant is taking longer than expected. Please try again shortly.",
              },
              HttpStatus.REQUEST_TIMEOUT,
            ),
          );
        }
      }, this.maxQueueWaitMs);

      const originalResolve = job.resolve;
      const originalReject = job.reject;

      job.resolve = (value: unknown) => {
        clearTimeout(waitTimer);
        originalResolve(value);
      };

      job.reject = (reason: unknown) => {
        clearTimeout(waitTimer);
        originalReject(reason);
      };

      this.queue.push(job);
      this.drain();
    });
  }

  private removeJob(job: QueueJob) {
    this.queue = this.queue.filter((candidate) => candidate !== job);
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift();

      if (!job || job.cancelled) continue;

      this.active += 1;
      job.started = true;

      void this.runJob(job);
    }
  }

  private async runJob(job: QueueJob) {
    try {
      const result = await job.run();

      if (!job.cancelled) {
        job.resolve(result);
      }
    } catch (error) {
      if (!job.cancelled) {
        job.reject(error);
      }
    } finally {
      this.active = Math.max(0, this.active - 1);
      this.activeSessions.delete(job.sessionKey);
      this.drain();
    }
  }
}
