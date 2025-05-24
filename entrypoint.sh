#!/usr/bin/env sh

chown -R appuser:appgroup /app/data
chmod -R 750         /app/data
exec su-exec appuser "$@"
