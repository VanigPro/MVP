#! /usr/bin/env bash

## A docker-compose wrapper script for overlaying conf files by env.

display_usage() {
  echo -e $"\nUsage: $0  {Compose command}
    \nExample: $0  up"
}

if [ "$#" -lt 1 ]; then
  display_usage
  exit 0
fi

cd sawtooth_docker_compose

compose_files="-f sawtooth-default.yaml"

echo -e "Using conf flags: $compose_files"

set -x

docker-compose $compose_files "$@"
