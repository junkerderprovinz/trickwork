# syntax=docker/dockerfile:1@sha256:572cebbc2b15e6f84c077742952674889cb63cd5e9b80abdffcbe587b6f19183
ARG NODE_VERSION=24-slim@sha256:873f586f3794f52281bd039bf02c048a0be08fde619338f9941bad1eb6b34530
ARG GO_VERSION=1.27@sha256:205c7636d74e0ffbe3d007162df7d74f859f5a8c8322dfb9f907977686c126cf

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
# The UI bundles the release notes at build time for its Release notes window.
COPY .github/release-notes ./.github/release-notes
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
