BASEDIR=$PWD/$(dirname "$0")
cd "$BASEDIR"

#   Templates.js \

pushd .

export BUILD_DIR=~/Downloads/acalc
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

cp manifest.json "$BUILD_DIR"
cp -r _locales "$BUILD_DIR"
cp -r icons "$BUILD_DIR"
cp bg.js "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp appDefinition=foam.apps.calc.ChromeApp "targetPath=$BUILD_DIR"

cd "$BUILD_DIR"
# Code compression.
#uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
#mv foam-min.js foam.js

popd
