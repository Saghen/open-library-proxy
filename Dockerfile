FROM oven/bun:1.1-slim

RUN chown bun:bun .
USER bun

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

ENV NODE_ENV=production
CMD ["bun", "start"]
