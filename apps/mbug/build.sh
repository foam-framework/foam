export BUILD_DIR=~/Downloads/mbug
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR

# TODO(markdittmer): This includes lots of stuff we don't actually need.
LIB_SRCS=`find ../../js -type f | grep '\.js$' | grep -v 'foam\/ui\/Window\.js' | grep -v 'foam\/patterns\/ChildTreeTrait\.js'`

cat \
  ../../core/stdlib.js \
  ../../core/WeakMap.js \
  ../../core/writer.js \
  ../../core/socket.js \
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
  ../../js/foam/ui/Window.js \
  ../../core/value.js \
  ../../js/foam/patterns/ChildTreeTrait.js \
  ../../core/view.js \
  ../../core/view2.js \
  ../../core/layout.js \
  ../../core/daoView.js \
  ../../core/ChoiceView.js \
  ../../core/DetailView.js \
  ../../core/TableView.js \
  ../../core/cview.js \
  ../../core/StackView.js \
  ../../core/RichTextView.js \
  ../../core/listchoiceview.js \
  ../../core/scroll.js \
  ../../core/HTMLParser.js \
  ../../core/mlang.js \
  ../../core/mlang2.js \
  ../../core/QueryParser.js \
  ../../core/search.js \
  ../../core/oam.js \
  ../../core/visitor.js \
  ../../core/messaging.js \
  ../../core/dao.js \
  ../../core/dao2.js \
  ../../core/KeywordDAO.js \
  ../../core/arrayDAO.js \
  ../../core/ClientDAO.js \
  ../../core/diff.js \
  ../../core/SplitDAO.js \
  ../../core/index.js \
  ../../core/StackView.js \
  ../../core/MementoMgr.js \
  ../../core/DAOController.js \
  ../../core/ThreePaneController.js \
  ../../core/experimental/protobufparser.js \
  ../../core/experimental/protobuf.js \
  ../../core/models.js \
  ../../core/touch.js \
  ../../core/glang.js \
  ../../core/oauth.js \
  ../../core/busy.js \
  ../../core/ChromeApp.js \
  ../../core/SyncManager.js \
  ../../core/AbstractDAOView.js \
  ../../core/DAOListView.js \
  $LIB_SRCS \
  ../quickcompose/google-analytics-bundle.js \
  > "$BUILD_DIR/foam.js"

mkdir -p "$BUILD_DIR/quickbug"
cp -r ../quickbug/* "$BUILD_DIR/quickbug/"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
