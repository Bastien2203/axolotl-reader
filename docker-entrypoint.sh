#!/bin/sh
chown -R axolotl:app /app/data /app/covers
exec "$@"
