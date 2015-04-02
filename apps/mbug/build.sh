#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
cd "$BASEDIR"

BUILD_DIR="$BASEDIR"/build

mkdir -p "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp appDefinition=foam.apps.mbug.WebApp "targetPath=$BUILD_DIR"

mkdir -p "$BUILD_DIR"/images
cp "$BASEDIR"/images/* "$BUILD_DIR"/images/
cp "$BASEDIR"/oauth2callback.html "$BUILD_DIR"/

cd "$BUILD_DIR"
# Code compression.
uglifyjs foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
