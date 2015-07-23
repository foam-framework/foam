#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
BUILD_DIR="$BASEDIR"/build
FOAM_DIR=../..
APP_DEF=foam.apps.builder.App
BASEDIR_FILES=( designer_view.html bg.js config.js manifest.json _locales 128.png builder.css )

pushd "$BASEDIR"


mkdir -p "$BUILD_DIR"

node --harmony "$FOAM_DIR/tools/foam.js" foam.build.BuildApp appDefinition=$APP_DEF "targetPath=$BUILD_DIR"
cp $FOAM_DIR/core/foam.css $BUILD_DIR/foam.css
for FILE in ${BASEDIR_FILES[@]}; do
  rm -rf $BUILD_DIR/$FILE
  cp -r $BASEDIR/$FILE $BUILD_DIR/$FILE
done

cd "$BUILD_DIR"
uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
#mv foam-min.js foam.js
rm unused.html

popd
