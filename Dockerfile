########################################################################
# Frontend Build (Node + Vite)
########################################################################
FROM --platform=$BUILDPLATFORM node:22.15-alpine AS node-builder

WORKDIR /app
COPY app/package.json ./
COPY app/package-lock.json ./
RUN npm install

ENV VITE_APP_ENV=production

COPY app/ .
RUN npm run build

########################################################################
# Backend Build (Go)
########################################################################
FROM golang:1.23-alpine AS go-builder

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT

RUN apk add --no-cache --virtual .build-deps \
    gcc \
    musl-dev \
    sqlite-dev \
    linux-headers \
    libc6-compat

WORKDIR /app

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api/ .

RUN echo "TARGETARCH=$TARGETARCH VARIANT=$TARGETVARIANT"
ENV CGO_ENABLED=1 \
    GOOS=$TARGETOS \
    GOARCH=$TARGETARCH 

RUN if [ "$TARGETARCH" = "arm" ]; then export GOARM="${TARGETVARIANT#v}"; fi && \
    go build -o api .

########################################################################
# 3) Final image (Alpine)
########################################################################
FROM alpine:3.21

RUN apk add --no-cache --virtual .runtime-deps sqlite
RUN apk add --no-cache su-exec

WORKDIR /app

RUN addgroup -g 1000 appgroup \
 && adduser -D -u 1000 -G appgroup appuser


COPY --from=go-builder /app/api    ./api
COPY --from=node-builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh

RUN chown -R appuser:appgroup /app
RUN chmod +x ./entrypoint.sh


ENV BOOK_DIRECTORY=/app/data/books \
    COVER_DIRECTORY=/app/data/covers \
    DATABASE_PATH=/app/data/comics.db

VOLUME ["/app/data"]
USER root
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
CMD ["./api"]



