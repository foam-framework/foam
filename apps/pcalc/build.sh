if [ "$#" != "1" ]; then
    echo "USAGE: $0 [app|web|gh-pages]"
    exit 1
fi

export NAME="pcalc"

BASEDIR=$(dirname "$0")
pushd "$BASEDIR" > /dev/null

if [ "$1" == "app" ]; then
    if [ "$BUILD_DIR" == "" ]; then
        export BUILD_DIR=~/Downloads/$NAME
    fi
    source ./app_sources.sh
elif [ "$1" == "web" ]; then
    export BUILD_DIR=~/Downloads/$NAME
    source ./web_sources.sh
elif [ "$1" == "gh-pages" ]; then
    export BUILD_DIR=../../../pcalc
    source ./web_sources.sh
else
    echo "USAGE: $0 [app|web|gh-pages]"
    exit 1
fi

if [ ! -d ../../bower_components/paper-button ]; then
    pushd ../../ > /dev/null
    echo "Cannot find Polymer components. Attempting to get Polymer..."
    sh ./get-polymer.sh
    popd > /dev/null
fi

cat ${SOURCES[@]} \
    | sed 's/^ *//g' \
    | sed 's/  */ /g' \
    | sed 's%^//.*%%g' \
    | sed 's% //.*%%g' \
    | sed '/^$/d' \
    | sed 's/ *( */(/g' \
    | sed 's/ *) */)/g' \
    | sed 's/ *{ */{/g' \
    | sed 's/ *} */}/g' \
    | sed 's/ *= */=/g' \
    | sed 's/ *: */:/g' \
    | sed 's/ *, */,/g' \
    | sed 's/ *; */;/g' \
    | sed 's/ *< */</g' \
    | sed 's/ *> */>/g' \
    | sed 's/! /!/g' \
    | sed 's/ + /+/g' \
    | sed 's/ *? */?/g' \
    | sed 's/ *|| */||/g' \
    | sed ':a;N;$!ba;s/\n/_NL_/g' \
    | perl -pe 's#_NL_/\*.*?\*/##g' \
    | sed 's/_NL_}/}/g' \
    | sed 's/{_NL_/{/g' \
    | sed 's/,_NL_/,/g' \
    | sed 's/_NL_/\n/g' \
          > "./foam.js"

vulcanize --inline --csp -o AppCalc.html AppCalc_.html

rm -rf $BUILD_DIR/*
mkdir -p $BUILD_DIR
for FILE in ${FILES[@]}; do
  cp -r $FILE $BUILD_DIR/
done

# Delete unneeded files
rm -f ${RM_FILES[@]}

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

popd > /dev/null
