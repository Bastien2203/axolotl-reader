########################################################################
# 1) Build Frontend (Node + Vite)                                      #
########################################################################
ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM node:23.11-alpine AS node-builder

WORKDIR /app
COPY app/package.json ./
COPY app/package-lock.json ./
RUN npm install

ENV VITE_APP_ENV=production


COPY app/ .
RUN npm run build

########################################################################
# 2) Build Backend (Go)                                                #
########################################################################
FROM --platform=linux/arm/v7 golang:1.23-alpine AS go-builder

RUN apk add --no-cache \
    gcc \
    musl-dev \
    sqlite-dev \
    linux-headers \
    libc6-compat

WORKDIR /app

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api/ .

ENV CGO_ENABLED=1 \
    GOOS=linux \
    GOARCH=arm \
    GOARM=7

RUN go build -o api ./main.go

########################################################################
# 3) Final image (Debian)                                              #
########################################################################
FROM --platform=$BUILDPLATFORM alpine:3.21

RUN apk add --no-cache sqlite

WORKDIR /app

ENV ENV="production" \
    BOOK_DIRECTORY="data" \
    COVER_DIRECTORY="covers" \
    DATABASE_PATH="comics.db" \
    JWT_TOKEN="your_jwt_secret" \
    API_HOST="https://axolotl.bastiengrisvard.com" \
    GIN_MODE=release

COPY --from=go-builder /app/api    ./api
COPY --from=node-builder /app/dist ./dist

EXPOSE 8080
CMD ["./api"]
