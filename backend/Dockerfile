FROM golang:1.25-alpine AS builder

WORKDIR /src

# Install certificates for HTTPS calls during build.
RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build a static Linux binary for a minimal runtime image.
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/sharex-server ./cmd/server


FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

ENV PORT=8080

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /out/sharex-server /app/sharex-server

EXPOSE 8080

ENTRYPOINT ["/app/sharex-server"]