#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
BUILD_DIR=~/Downloads/ctm
FOAM_DIR=../../../..

pushd "$BASEDIR"


mkdir -p "$BUILD_DIR"

node --harmony "$FOAM_DIR/tools/foam.js" foam.build.BuildApp appDefinition=foam.apps.ctm.CTMApp "targetPath=$BUILD_DIR"
cp $FOAM_DIR/core/foam.css $BUILD_DIR/foam.css

popd
