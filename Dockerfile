# Multi-stage Dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

FROM base AS development
RUN npm install
COPY . .
# Keep alive for hot reloading in compose
CMD ["npm", "run", "dev:api"]

FROM base AS builder
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Prisma needs generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
CMD ["node", "dist/api/index.js"]
