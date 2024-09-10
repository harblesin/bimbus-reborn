FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./

COPY --from=builder /app/build ./build

COPY main.ts ./

EXPOSE 80
EXPOSE 443

CMD ["ts-node", "main.ts"]