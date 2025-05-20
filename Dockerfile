########################################################################
# 1) Build Frontend (Node + Vite)                                      #
########################################################################
ARG BUILDPLATFORM
FROM --platform=${BUILDPLATFORM} node:23.11-bullseye-slim AS node-builder

WORKDIR /app
COPY app/package.json app/package-lock.json ./

ENV VITE_APP_ENV=production


RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && npm install --ignore-scripts \
  && npm rebuild \
  && rm -rf /var/lib/apt/lists/*


COPY app/ .
RUN npm run build

########################################################################
# 2) Build Backend (Go)                                                #
########################################################################
FROM --platform=${BUILDPLATFORM} golang:1.23-bullseye AS go-builder

WORKDIR /app
COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api/ .
RUN apt-get update \
 && apt-get install -y gcc libc6-dev \
 && rm -rf /var/lib/apt/lists/*

ENV CGO_ENABLED=0
ENV GOARCH=arm64
ENV GOOS=linux

RUN go build -o api ./main.go

########################################################################
# 3) Final image (Debian)                                              #
########################################################################
FROM --platform=${TARGETPLATFORM} debian:bullseye-slim

WORKDIR /app

ENV ENV="production"
ENV BOOK_DIRECTORY="data"
ENV COVER_DIRECTORY="covers"
ENV DATABASE_PATH="comics.db"
ENV JWT_TOKEN="your_jwt_secret"
ENV API_HOST="https://axolotl.bastiengrisvard.com"


COPY --from=go-builder /app/api    ./api
COPY --from=node-builder /app/dist ./dist


RUN apt-get update \
 && apt-get install -y ca-certificates \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 8080
CMD ["./api"]
