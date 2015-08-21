#!/bin/sh

BASEDIR=$(dirname $0)
# $BUILD_DIR and $NAME come from build.sh.
source "$BASEDIR/build.sh"

set -e
cd $BUILD_DIR
zip -r "$NAME.zip" *

echo "Constructed zip: $BUILD_DIR/$NAME.zip"
