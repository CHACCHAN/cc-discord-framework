FROM oven/bun:1.3.11-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    ffmpeg

ARG APP_NAME=discord-bot
WORKDIR /usr/src/${APP_NAME}

COPY ${APP_NAME}/package*.json ${APP_NAME}/bun.lockb* ./
RUN bun install --frozen-lockfile

COPY ${APP_NAME}/ .

CMD ["sh", "-c", "bun run api:setup && bun run start"]