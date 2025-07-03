# Stage 1: Build the Go binary
FROM golang:1.23.6-alpine AS builder

WORKDIR /app

# Copy go.mod & go.sum first for dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Stage 2: Create minimal runtime image
FROM alpine:latest

WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/app .

# Expose port (optional)
EXPOSE 3000

# Run the binary
CMD ["./app"]
