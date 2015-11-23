#!/bin/sh

set -e

BASEDIR=$PWD/$(dirname "$0")
BUILD_DIR="$BASEDIR"/build
FOAM_DIR=../..
APP_DEF=com.google.nbuEDU.App
BASEDIR_FILES=( index.html designer_view.html app_view.html app_bg.js config.js manifest.json fonts fonts.css builder.css empty.html )

pushd "$BASEDIR"


mkdir -p "$BUILD_DIR"

node --harmony "$FOAM_DIR/tools/foam.js" foam.build.BuildApp appDefinition=$APP_DEF "targetPath=$BUILD_DIR"
cp "$FOAM_DIR/core/foam.css" "$BUILD_DIR/foam.css"
mkdir -p "$BUILD_DIR/resources/svg"
cp $FOAM_DIR/resources/svg/*.svg "$BUILD_DIR/resources/svg"
for FILE in ${BASEDIR_FILES[@]}; do
  rm -rf "$BUILD_DIR/$FILE"
  cp -r "$BASEDIR/$FILE" "$BUILD_DIR/$FILE"
done

cd "$BUILD_DIR"
 uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
 mv foam-min.js foam.js
 rm unused.html

popd
