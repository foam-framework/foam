#!/bin/sh

BASEDIR=$(readlink -f $(dirname "$0"))
cd "$BASEDIR"

BUILD_DIR=~/Downloads/quickbug
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

file () {
    TARGET="$BUILD_DIR"
    if [ $# -gt 1 ]; then
        TARGET="${TARGET}/${2}"
    fi
    cp "$1" "$TARGET"
}

directory () {
    TARGET="$BUILD_DIR"
    if [ $# -gt 1 ]; then
        TARGET="${TARGET}/${2}"
    fi
    cp -r "$1" "$TARGET"
}

file manifest_prod.json manifest.json
file ../../core/foam.css
directory images
file empty.html

cd ../../
node --harmony tools/foam.js foam.build.BuildChromeApp appDefinition=foam.apps.quickbug.ChromeApp targetPath="$BUILD_DIR"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
