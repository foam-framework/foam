#!/bin/sh

BASEDIR=$PWD/$(dirname "$0")
BUILD_DIR="$BASEDIR"/build
FOAM_DIR=../..
APP_DEF=com.google.ymp.App

pushd "$BASEDIR"


mkdir -p "$BUILD_DIR"

node --harmony "$FOAM_DIR/tools/foam.js" foam.build.BuildApp appDefinition=$APP_DEF version=`date +%Y.%m.%d.%H.%M.%S` "targetPath=$BUILD_DIR"
cp "$FOAM_DIR/fonts.css" "$BUILD_DIR/fonts.css"

cp *.png ./build/
cp manifest_build.json build/manifest.json
cp index_build.html build/main.html

cd "$BUILD_DIR"
uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
# rm unused.html


popd
