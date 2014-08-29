cp manifest_test.json manifest.json
export BUILD_DIR=~/Downloads/quickbug
rm -rf $BUILD_DIR
rm -rf core
mkdir core
cp -r ../../core/* core
cp ../../lib/bookmarks/bookmark.js core
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
