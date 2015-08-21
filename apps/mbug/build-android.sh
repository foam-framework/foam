#!/bin/sh

BASEDIR=$(readlink -f "$(dirname "$0")")
cd "$BASEDIR"

BUILD_DIR="$BASEDIR"/build-android

mkdir -p "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp appDefinition=foam.apps.mbug.CordovaApp "targetPath=$BUILD_DIR"

mkdir -p "$BUILD_DIR"/images
cp "$BASEDIR"/images/* "$BUILD_DIR"/images/
cp "$BASEDIR"/manifest.json "$BUILD_DIR"/
cp "$BASEDIR"/manifest.mobile.json "$BUILD_DIR"/
cp "$BASEDIR"/bg.js "$BUILD_DIR"/

cd "$BUILD_DIR"
# Code compression.
uglifyjs foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
