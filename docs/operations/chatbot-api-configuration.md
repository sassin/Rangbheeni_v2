# Chatbot API Configuration

This document lists the environment variables used by the Rangbheeni chatbot API.

The chatbot API must protect itself server-side. Frontend limits improve user experience, but they can be bypassed by direct API calls. Core abuse controls should therefore live in chatbot-api environment variables.

## Where to configure variables

Production:

- Configure these in Railway for the `chatbot-api` service.
- Do not commit secrets to Git.

Local development:

- Use a local `.env` file only if ignored by Git.
- Never commit real API keys, database URLs, or private admin keys.

## Recommended production baseline

```env
CORS_ORIGIN=https://rangbheeni-v2-web.vercel.app,http://localhost:3000

CHATBOT_PUBLIC_ENABLED=true
CHATBOT_BODY_LIMIT=8kb

CHATBOT_MAX_WORDS=80
CHATBOT_MAX_CHARS=700
CHATBOT_ABSOLUTE_MAX_CHARS=2000
CHATBOT_SERVICE_MAX_CHARS=900
CHATBOT_SESSION_MAX_CHARS=120

CHATBOT_MIN_INTERVAL_MS=5000
CHATBOT_RATE_WINDOW_MS=60000
CHATBOT_MAX_PER_WINDOW=8
CHATBOT_MAX_PER_DAY=35
CHATBOT_MAX_CONCURRENT_TOTAL=3
CHATBOT_MAX_CONCURRENT_PER_CLIENT=1
CHATBOT_MAX_REPEAT_COUNT=3
CHATBOT_MAX_TRACKED_CLIENTS=5000

CHATBOT_KNOWLEDGE_SEARCH_LIMIT=8
CHATBOT_CONTEXT_CHUNK_LIMIT=6
CHATBOT_CHUNK_MAX_CHARS=1100
CHATBOT_MAX_CONTEXT_CHARS=6000
CHATBOT_MIN_SCORE=0.2
CHATBOT_SAVE_MESSAGES=true

LLM_CHAT_MODEL=gpt-4o-mini
LLM_TIMEOUT_MS=20000
LLM_MAX_TOKENS=120
LLM_TEMPERATURE=0.2
LLM_MAX_ANSWER_WORDS=90
LLM_MAX_ANSWER_SENTENCES=4

Secrets should exist only in Railway or ignored local env files:

DATABASE_URL=...
LLM_API_KEY=...
CHATBOT_PRIVATE_API_KEY=...
1. Server and network configuration
Variable    Default    Description    Recommended production value
PORT    Railway-managed    Generic platform port. Railway usually injects this.    Leave managed by Railway
CHATBOT_API_PORT    4100    Explicit chatbot API port, mainly for local development.    Usually not needed in Railway
CORS_ORIGIN    http://localhost:3000    Comma-separated list of frontend origins allowed to call the chatbot API.    https://rangbheeni-v2-web.vercel.app,http://localhost:3000
CHATBOT_BODY_LIMIT    8kb    Maximum request body size accepted by the chatbot API.    8kb

Do not use CORS_ORIGIN=* in production.

2. Public availability controls
Variable    Default    Description    Recommended production value
CHATBOT_PUBLIC_ENABLED    true    Main server-side kill switch for public chatbot requests.    true normally; false during abuse or maintenance
CHATBOT_PRIVATE_API_KEY    none    Private key required for protected admin operations such as /chat/reindex.    Strong random secret

To disable public chatbot access immediately:

CHATBOT_PUBLIC_ENABLED=false

This is safer than hiding the widget only on the frontend because direct API calls are also blocked.

3. Input size limits
Variable    Default    Description    Recommended production value
CHATBOT_MAX_WORDS    80    Maximum words accepted from a public request after normalization.    80
CHATBOT_MAX_CHARS    700    Maximum characters passed forward after normalization. Longer messages are truncated.    700
CHATBOT_ABSOLUTE_MAX_CHARS    2000    Hard upper limit. Requests above this are rejected.    2000
CHATBOT_SERVICE_MAX_CHARS    900    Internal service-level guard before knowledge search and LLM call.    900
CHATBOT_SESSION_MAX_CHARS    120    Maximum accepted session ID length after sanitization.    120

Moderately long messages are trimmed. Extremely long messages are rejected.

4. Rate limits
Variable    Default    Description    Recommended production value
CHATBOT_MIN_INTERVAL_MS    5000    Minimum delay between messages from the same IP/session client key.    5000
CHATBOT_RATE_WINDOW_MS    60000    Rate-limit window size in milliseconds.    60000
CHATBOT_MAX_PER_WINDOW    10    Maximum messages allowed per client within the rate window.    8
CHATBOT_MAX_PER_MINUTE    legacy fallback    Backward-compatible fallback if CHATBOT_MAX_PER_WINDOW is not set.    Prefer CHATBOT_MAX_PER_WINDOW
CHATBOT_MAX_PER_DAY    40    Maximum messages per client per day.    35
CHATBOT_MAX_REPEAT_COUNT    3    Maximum repeated identical messages before blocking temporarily.    3
CHATBOT_MAX_TRACKED_CLIENTS    5000    Maximum number of in-memory client states retained for rate limiting.    5000

Client identity is based on forwarded IP headers plus sanitized session ID. This is not perfect identity, but it is enough for a low-cost public chatbot.

5. Concurrency limits
Variable    Default    Description    Recommended production value
CHATBOT_MAX_CONCURRENT_TOTAL    3    Maximum chatbot requests processed at once across the API instance.    3
CHATBOT_MAX_CONCURRENT_PER_CLIENT    1    Maximum active chatbot requests for one client key.    1

Rate limits control frequency. Concurrency limits control pressure on Railway, database, knowledge search, and LLM calls.

6. Knowledge retrieval and context limits
Variable    Default    Description    Recommended production value
CHATBOT_KNOWLEDGE_SEARCH_LIMIT    8    Number of candidate chunks retrieved from the knowledge base.    8
CHATBOT_CONTEXT_CHUNK_LIMIT    6    Maximum chunks included in the LLM prompt context.    6
CHATBOT_CHUNK_MAX_CHARS    1100    Maximum characters taken from each retrieved chunk.    1100
CHATBOT_MAX_CONTEXT_CHARS    6000    Maximum total context characters sent to the LLM.    6000
CHATBOT_MIN_SCORE    0.2    Minimum retrieval score required for a chunk to be considered useful.    0.2

Increase these only if the chatbot needs more context and cost/performance are acceptable.

Lower these if responses are slow, cost increases, or unrelated context is being included.

7. LLM configuration
Variable    Default    Description    Recommended production value
LLM_API_KEY    none    API key for the LLM provider. Required for AI responses.    Secret in Railway
LLM_BASE_URL    https://api.openai.com/v1    OpenAI-compatible base URL.    Leave default unless switching provider
LLM_CHAT_MODEL    gpt-4o-mini    Chat model used by the assistant.    gpt-4o-mini
LLM_TIMEOUT_MS    20000    Maximum time allowed for the LLM request before fallback.    20000
LLM_MAX_TOKENS    120    Maximum output tokens requested from the LLM.    120
LLM_TEMPERATURE    0.2    Response variability. Lower is better for factual website assistant behavior.    0.2
LLM_MAX_ANSWER_WORDS    90    Final server-side word cap on the assistant answer.    90
LLM_MAX_ANSWER_SENTENCES    4    Final server-side sentence cap on the assistant answer.    4

The chatbot should answer only from Rangbheeni-provided context. If the context does not support an answer, the API should return the fallback response.

8. Storage and logging
Variable    Default    Description    Recommended production value
DATABASE_URL    none    Database connection URL used by Prisma.    Secret in Railway
CHATBOT_SAVE_MESSAGES    true    Whether to save chatbot messages and assistant responses to the database.    true
RANGBHEENI_CONTACT_EMAIL    enquiries.rangbheeni@gmail.com    Email address shown in fallback responses.    Official Rangbheeni enquiry email

Saved chatbot messages may contain user-provided text. Avoid collecting unnecessary sensitive information and keep message length capped.

To disable chat history saving:

CHATBOT_SAVE_MESSAGES=false
9. Admin endpoint protection

Endpoint:

POST /chat/reindex

Required header:

x-api-key: <CHATBOT_PRIVATE_API_KEY>

Never expose this key in frontend code or public docs.

10. Emergency playbooks
Stop public chatbot
CHATBOT_PUBLIC_ENABLED=false
Reduce LLM spend quickly
CHATBOT_MAX_PER_DAY=10
CHATBOT_MAX_PER_WINDOW=3
CHATBOT_MAX_CONCURRENT_TOTAL=1
LLM_MAX_TOKENS=80
LLM_TIMEOUT_MS=10000
Disable chat history saving
CHATBOT_SAVE_MESSAGES=false
Restrict browser calls to production frontend only
CORS_ORIGIN=https://rangbheeni-v2-web.vercel.app
11. Maintenance checklist

Before changing limits, check:

Is the website under abuse?
Are Railway CPU or memory limits being hit?
Is LLM spend increasing?
Are valid users getting blocked?
Is the chatbot answering slowly?
Are fallback responses increasing?

After changing limits, test:

Invoke-RestMethod "https://chatbot-api-production-00a2.up.railway.app/health"

Then test one normal chatbot request from the website.

12. Variable ownership
Category    Prefer env var or DB?    Reason
Secrets    Env    Must not depend on DB and must not be visible in frontend
Rate limits    Env    Must work even if DB is down
Kill switches    Env    Reliable during incidents
LLM model, tokens, timeouts    Env    Operational safety controls
Public content and copy    DB    Editable content, not security-critical
Feature visibility    Env or DB    Env for emergency, DB for admin-managed content
