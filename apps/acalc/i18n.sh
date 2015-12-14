BASEDIR=$PWD
cd "$BASEDIR"

pushd .

export BUILD_DIR="$BASEDIR/_locales/en"

cd ../../
node --harmony tools/foam.js foam.build.I18nApp appDefinition=foam.apps.calc.WebApp extraClassPaths="$BASEDIR" "targetPath=$BUILD_DIR"

popd
