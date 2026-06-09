import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

@Injectable()
export class StorageService {
  private client: S3Client | null = null;

  private getClient() {
    if (this.client) return this.client;
    const endpoint = process.env.S3_ENDPOINT || undefined;
    this.client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
    return this.client;
  }

  async createPresignedUpload(input: { filename: string; contentType: string }) {
    const bucket = process.env.S3_BUCKET;
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
    if (!bucket || !publicBaseUrl) throw new Error("S3_BUCKET and S3_PUBLIC_BASE_URL are required");

    const safeName = input.filename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: input.contentType });
    const uploadUrl = await getSignedUrl(this.getClient(), command, { expiresIn: 900 });
    const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
    return { key, uploadUrl, publicUrl, expiresInSeconds: 900 };
  }
}
