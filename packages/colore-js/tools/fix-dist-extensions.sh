#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../" || exit 255

find ./dist/cjs/ -type f -name '*.cjs' -print0 | xargs -0 grep -l '\.js"' | xargs perl -i -pe 's/\.js"/.cjs"/g'
find ./dist/esm/ -type f -name '*.mjs' -print0 | xargs -0 grep -l '\.js"' | xargs perl -i -pe 's/\.js"/.mjs"/g'
if [ -f ./dist/esm/index.d.ts ] ; then mv ./dist/esm/index.d.ts ./dist/esm/index.d.mts ; fi
