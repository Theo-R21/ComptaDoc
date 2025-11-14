#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 3306; do
  echo "Waiting for MariaDB at $host:3306..."
  sleep 2
done

exec $cmd
