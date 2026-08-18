# syntax=docker/dockerfile:1
ARG NODE_VERSION=24
ARG GO_VERSION=1.26

FROM node:${NODE_VERSION}-slim AS client
WORKDIR /app
COPY package.json ./
COPY core/package.json core/
COPY ui/package.json ui/
RUN npm install
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
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/ascii-supergenerator ./container

FROM gcr.io/distroless/static-debian12:latest@sha256:a9fcaedd4c9b59e12dd65d954f0b5044f19b0647a8a3712e77205df9e7b102cd AS runtime
LABEL org.opencontainers.image.title="ASCII SuperGenerator" \
      org.opencontainers.image.description="Turns images into proportional-font-aware ASCII art, self-hosted" \
      org.opencontainers.image.source="https://github.com/junkerderprovinz/ascii-supergenerator" \
      org.opencontainers.image.licenses="AGPL-3.0"
COPY --from=gobuild /out/ascii-supergenerator /ascii-supergenerator
ENV PORT=3210
EXPOSE 3210
ENTRYPOINT ["/ascii-supergenerator"]
