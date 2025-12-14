# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY web/ ./
RUN yarn build

# Stage 2: Build Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
# Install build dependencies for SQLite (CGO)
RUN apk add --no-cache build-base
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go

# Stage 3: Final Image
FROM alpine:latest
WORKDIR /app
# Install runtime dependencies
RUN apk add --no-cache ca-certificates sqlite-libs
# Copy binary from backend-builder
COPY --from=backend-builder /app/server .
# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/web/dist ./dist
# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 8080

# Run the server
CMD ["./server"]
