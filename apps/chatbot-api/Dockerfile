FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma
COPY tsconfig*.json ./

RUN npm ci
RUN npx prisma generate
RUN npm --workspace @rangbheeni/chatbot-api run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/apps/chatbot-api ./apps/chatbot-api
COPY --from=build /app/packages ./packages
COPY --from=build /app/prisma ./prisma

CMD ["node", "apps/chatbot-api/dist/main.js"]
