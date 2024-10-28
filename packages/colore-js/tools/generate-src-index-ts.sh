#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../" || exit 255

(
	cd src
	find . -name '*.ts' -size +0 | sort | xargs -I % echo "export * from '%'" | sed 's/\.ts/.js/g' > ./index.ts
) && node_modules/.bin/eslint --fix src/index.ts
