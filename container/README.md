# ASCII SuperGenerator — container build

A minimal Go HTTP server whose only job is serving the same built `ui/`
bundle the desktop build embeds (via the shared `webembed` package) — no API
endpoints, no backend logic, no database, no volumes required.

## Run locally

```
docker build -t ascii-supergenerator:dev -f container/Dockerfile .
docker run -p 3210:3210 ascii-supergenerator:dev
```

Open `http://localhost:3210/`.
