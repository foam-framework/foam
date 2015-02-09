BASEDIR=$(dirname "$0")
cd "$BASEDIR"

ON_GH_PAGES_BRANCH=`git branch | grep '^[*] gh-pages$'`
if [ "$ON_GH_PAGES_BRANCH" == "" ]; then
    echo "ERROR: Only for use in gh-pages branch"
    exit 1
fi

export BUILD_DIR=../../../pcalc
export FILES=(
  "GHCalc.html"
  "Calc.js"
  "fonts"
  "CalcConfig.js"
)

mkdir -p $BUILD_DIR
rm -rf $BUILD_DIR/*
for FILE in ${FILES[@]}; do
  cp -r $FILE $BUILD_DIR/
done
