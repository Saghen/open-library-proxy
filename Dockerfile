FROM oven/bun:1.1-slim

# USER bun
COPY package.json bun.lockb .
RUN bun install --production

COPY . .

CMD ["bun", "start"]
