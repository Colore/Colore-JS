#!/bin/bash

EXAMPLE=ping

CMD=""

if [ $# -gt 0 ]; then
    CMD="$@"
fi

docker build \
    -t colore/example:${EXAMPLE} \
    -f examples/ping/Dockerfile \
    . &&
    docker run \
        -it \
        --rm \
        -p 3742:3742 \
        -v $(pwd):/colore \
        colore/example:${EXAMPLE} \
        ${CMD}
