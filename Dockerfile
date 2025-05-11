FROM node:22.15-bullseye AS node-builder

WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app/ .
RUN npm run build


FROM golang:1.23 AS go-builder

WORKDIR /app

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY ./api .

RUN apt-get update && apt-get install -y gcc libc6-dev
ENV CGO_ENABLED=1
RUN go build -o api ./main.go


FROM golang:1.23

WORKDIR /app
COPY --from=go-builder /app/api ./api
COPY --from=go-builder /app/.env ./.env
COPY --from=node-builder /app/dist ./dist

EXPOSE 8080
CMD ["./api"]


