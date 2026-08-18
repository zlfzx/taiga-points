# Stage 1: Build the Go binary
FROM golang:1.25.0-alpine AS builder

WORKDIR /app

# Install C compiler and SQLite development libraries
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go.mod & go.sum first for dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary with CGO enabled
RUN CGO_ENABLED=1 go build -o app .

# Stage 2: Create minimal runtime image
FROM alpine:latest

WORKDIR /app

# Runtime dependencies for SQLite and C libs
RUN apk add --no-cache sqlite-libs

# Copy binary from builder stage
COPY --from=builder /app/app .

EXPOSE 3000
CMD ["./app"]
