export BUILD_DIR=~/Downloads/acalc
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cat \
  ../../core/stdlib.js \
  ../../core/async.js \
  ../../core/parse.js \
  ../../core/event.js \
  ../../core/JSONUtil.js \
  ../../core/XMLUtil.js \
  ../../core/context.js \
  ../../core/JSONParser.js \
  ../../core/TemplateUtil.js \
  ../../core/ChromeEval.js \
  ../../core/FOAM.js \
  ../../core/FObject.js \
  ../../core/BootstrapModel.js \
  ../../core/mm1Model.js \
  ../../core/mm2Property.js \
  ../../core/mm3Types.js \
  ../../core/mm4Method.js \
  ../../core/mm5Misc.js \
  ../../core/LayoutTraits.js \
  ../../core/value.js \
  ../../core/view.js \
  ../../core/daoView.js \
  ../../core/DetailView.js \
  ../../core/cview2.js \
  ../../core/CViewPrimitives.js \
  ../../core/HTMLParser.js \
  ../../core/visitor.js \
  ../../core/touch.js \
  ../../core/ChromeApp.js \
  ../../js/foam/ui/animated/Label.js \
  ../../js/foam/ui/md/Flare.js \
  > "$BUILD_DIR/foam.js"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
