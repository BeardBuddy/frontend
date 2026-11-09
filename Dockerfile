# Runtime-only image: CI builds the app and this just packages the output.
# For a from-source build use Dockerfile.local.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 10001 nodejs && adduser -S -u 10001 -G nodejs nextjs

# Produced by `npm run build` with output: "standalone".
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

USER nextjs
EXPOSE 3000
# API_BASE_URL is read at request time by /api/config, so one image runs anywhere.
ENV PORT=3000 HOSTNAME=0.0.0.0 API_BASE_URL=http://localhost:8080
CMD ["node", "server.js"]
