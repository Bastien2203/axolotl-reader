# --------- Front build (Node + Vite) ---------
FROM node:22.15-bullseye AS node-builder

WORKDIR /app

COPY app/package*.json ./
RUN apt-get update && apt-get install -y python3 make g++
RUN npm install --ignore-scripts && npm rebuild

COPY app/ .
RUN npm run build


# --------- Backend build (Go) ---------
FROM golang:1.23-bullseye AS go-builder

WORKDIR /app

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api .

RUN apt-get update && apt-get install -y gcc libc6-dev
ENV CGO_ENABLED=1
RUN go build -o api ./main.go


# --------- Final image (slim) ---------
FROM debian:bullseye-slim

WORKDIR /app

# Copie binaire Go + config
COPY --from=go-builder /app/api ./api
COPY --from=go-builder /app/.env ./.env

# Copie frontend précompilé
COPY --from=node-builder /app/dist ./dist

# Runtime deps minimal
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

EXPOSE 8080
CMD ["./api"]
    