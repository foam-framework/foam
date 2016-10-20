#!/bin/bash

set -e


SCRIPT_PATH="${PWD}/$(dirname "$0")"
if [ "$SCRIPT_PATH" ] && [ "$SCRIPT_PATH" != ${0} ]; then
    cd "$SCRIPT_PATH"
fi

BUILD_DIR="${SCRIPT_PATH}/build"

mkdir -p $BUILD_DIR

cp -r index.html manifest.json manifest.mobile.json fonts icons images "$BUILD_DIR"
cp ../../core/foam.css "$BUILD_DIR"

pushd ../../
node tools/foam.js foam.build.BuildApp appDefinition=com.google.mail.WebApp "targetPath=$BUILD_DIR"
popd

rm "${BUILD_DIR}/main.html"

cd "$BUILD_DIR"
# Code compression.
uglifyjs foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
