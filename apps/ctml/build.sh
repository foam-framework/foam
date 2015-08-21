#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
BUILD_DIR="$BASEDIR"/build
FOAM_DIR=../..

pushd "$BASEDIR"


mkdir -p "$BUILD_DIR"

node --harmony "$FOAM_DIR/tools/foam.js" foam.build.BuildApp appDefinition=foam.apps.ctml.CTMApp "targetPath=$BUILD_DIR"
cp $FOAM_DIR/core/foam.css $BUILD_DIR/foam.css

cd "$BUILD_DIR"
# uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
# mv foam-min.js foam.js

popd
