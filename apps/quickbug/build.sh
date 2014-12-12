cp manifest_prod.json manifest.json
export BUILD_DIR=~/Downloads/quickbug
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR
cat \
  ../../core/i18n.js \
  ../../core/stdlib.js \
  ../../core/io.js \
  ../../core/writer.js \
  ../../core/socket.js \
  ../../core/base64.js \
  ../../core/encodings.js \
  ../../core/utf8.js \
  ../../core/async.js \
  ../../core/parse.js \
  ../../core/event.js \
  ../../core/JSONUtil.js \
  ../../core/XMLUtil.js \
  ../../core/context.js \
  ../../core/JSONParser.js \
  ../../core/TemplateUtil.js \
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
  ../../core/view2.js \
  ../../core/layout.js \
  ../../core/daoView.js \
  ../../core/ChoiceView.js \
  ../../core/DetailView.js \
  ../../core/TableView.js \
  ../../core/cview.js \
  ../../core/cview2.js \
  ../../core/RichTextView.js \
  ../../core/listchoiceview.js \
  ../../core/scroll.js \
  ../../core/CViewPrimitives.js \
  ../../core/Diagramming.js \
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
  ../../lib/bookmarks/bookmark.js \
  ../../core/turntable.js \
  ../../core/ChromeApp.js \
  ../../core/ChromeStorage.js \
  ../../core/SyncManager.js \
  ../../core/CORE.js \
  > "$BUILD_DIR/foam.js"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
