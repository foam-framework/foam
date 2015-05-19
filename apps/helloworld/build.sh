#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
cd "$BASEDIR"

BUILD_DIR="$BASEDIR"/build

mkdir -p "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp appDefinition=foam.demos.HelloWorldApp "targetPath=$BUILD_DIR"

cd "$BUILD_DIR"
# Code compression.
# uglifyjs -b semicolons=false,beautify=false asdf/foam.js -c unused=false > asdf/foam-min.js
# mv foam-min.js foam.js
cd ..
