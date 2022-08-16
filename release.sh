#!/bin/bash
VERSION=$1

sed -E 's/"version": "([0-9]+\.[0-9]+\.[0-9]+)"/"version": "'$VERSION'"/g' package.json > package.json.new ; mv package.json.new package.json
sed -E 's/([0-9]+\.[0-9]+\.[0-9]+)/'$VERSION'/g' README.md > README.md.new ; mv README.md.new README.md
npm run build && \
    git commit -am "Releasing $VERSION" && \
    git tag $VERSION && \
    git push origin master && git push origin $VERSION