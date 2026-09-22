# Download the latest PocketBase Linux release.
FROM alpine:3.20 AS downloader

RUN apk add --no-cache ca-certificates curl jq unzip \
    && DOWNLOAD_URL="$(curl -fsSL https://api.github.com/repos/pocketbase/pocketbase/releases/latest \
      | jq -r '.assets[] | select(.name | endswith("_linux_amd64.zip")) | .browser_download_url' \
      | head -n 1)" \
    && test -n "$DOWNLOAD_URL" \
    && curl -fsSL "$DOWNLOAD_URL" -o /tmp/pocketbase.zip \
    && unzip /tmp/pocketbase.zip pocketbase -d /opt/pocketbase \
    && chmod +x /opt/pocketbase/pocketbase

FROM alpine:3.20

RUN apk add --no-cache ca-certificates

WORKDIR /pb
COPY --from=downloader /opt/pocketbase/pocketbase /pb/pocketbase

ENV PORT=8080
EXPOSE 8080
VOLUME ["/pb/pb_data"]

CMD ["sh", "-c", "/pb/pocketbase serve --http=0.0.0.0:${PORT:-8080}"]
