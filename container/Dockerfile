# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
ARG NODE_VERSION=24-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
ARG GO_VERSION=1.27@sha256:f20d83a83e18dbd2a4714b8ffd4b30b287b6243962dd75608e86abcc63ba4efc

FROM node:${NODE_VERSION} AS client
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY core/package.json core/
COPY ui/package.json ui/
RUN npm ci
COPY core ./core
COPY ui ./ui
RUN npm run build --workspace core
RUN npm run build --workspace ui

FROM golang:${GO_VERSION} AS gobuild
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY webembed ./webembed
COPY container ./container
COPY --from=client /app/ui/dist ./webembed/dist
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/trickwork ./container

FROM gcr.io/distroless/static-debian12:latest@sha256:d75cdd72874d4790092fcb1b058493ecf6bb5bf2b2b897045b00ff01d91843f2 AS runtime
LABEL org.opencontainers.image.title="TrickWork" \
      org.opencontainers.image.description="Turns images into proportional-font-aware ASCII art, self-hosted" \
      org.opencontainers.image.source="https://github.com/junkerderprovinz/trickwork" \
      org.opencontainers.image.licenses="AGPL-3.0"
COPY --from=gobuild /out/trickwork /trickwork
ENV PORT=3210
EXPOSE 3210
USER nonroot:nonroot
ENTRYPOINT ["/trickwork"]
