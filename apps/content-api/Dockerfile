FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/content-api/package.json apps/content-api/package.json
COPY apps/chatbot-api/package.json apps/chatbot-api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/seed-data/package.json packages/seed-data/package.json
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm --workspace @rangbheeni/content-api run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/apps/content-api/dist ./apps/content-api/dist
CMD ["node", "apps/content-api/dist/main.js"]
