BASEDIR=$(dirname "$0")

# Pushd to popd just before sourcing build.sh
pushd "$BASEDIR" > /dev/null

# Assuming we're in the foam submodule of the gh-pages branch:

# Get out of foam submodule
pushd ../../../  > /dev/null

ON_GH_PAGES_BRANCH=`git branch | grep '^[*] gh-pages$'`

# Come back to the intended working directory
popd > /dev/null

if [ "$ON_GH_PAGES_BRANCH" == "" ]; then
    echo "ERROR: Only for use in gh-pages branch"
    exit 1
fi

# build.sh expects to start in our original directory
popd > /dev/null

# build.sh export BUILD_DIR
source $BASEDIR/build.sh

# BUILD_DIR may be relative to BASEDIR, so push it back
pushd "$BASEDIR" > /dev/null

export PCALC_GH_DIR=../../../pcalc

mkdir -p "$PCALC_GH_DIR"
rm -rf $PCALC_GH_DIR/*
cp -r $BUILD_DIR/* $PCALC_GH_DIR/

# Don't leave our BASEDIR on the dir stack
popd > /dev/null
