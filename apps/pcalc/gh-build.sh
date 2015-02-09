BASEDIR=$(dirname "$0")
cd "$BASEDIR"

# Assuming we're in the foam submodule of the gh-pages branch:

# Get out of foam submodule
pushd ../../../ > /dev/null

ON_GH_PAGES_BRANCH=`git branch | grep '^[*] gh-pages$'`

# Come back to the intended working directory
popd > /dev/null

if [ "$ON_GH_PAGES_BRANCH" == "" ]; then
    echo "ERROR: Only for use in gh-pages branch"
    exit 1
fi

# build.sh export BUILD_DIR
BUILD_OUTPUT=`source ./build.sh`

if [ "$BUILD_OUTPUT" != "" ]; then
    echo "ERROR: Expected no output from build.sh (actual output below)"
    echo "$BUILD_OUTPUT"
    exit 1
fi

export PCALC_GH_DIR=../../../pcalc

rm -rf "$PCALC_GH_DIR/*"
cp -r "$BUILD_DIR/*" "$PCALC_GH_DIR/"
