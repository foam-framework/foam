export BUILD_DIR=~/Downloads/mgmail
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR
cat \
  ../../core/stdlib.js \
  ../../core/WeakMap.js \
  ../../core/io.js \
  ../../core/writer.js \
  ../../core/socket.js \
  ../../core/base64.js \
  ../../core/encodings.js \
  ../../core/utf8.js \
  ../../core/parse.js \
  ../../core/event.js \
  ../../core/JSONUtil.js \
  ../../core/XMLUtil.js \
  ../../core/context.js \
  ../../core/FOAM.js \
  ../../core/JSONParser.js \
  ../../core/TemplateUtil.js \
  ../../core/FObject.js \
  ../../core/BootstrapModel.js \
  ../../core/mm1Model.js \
  ../../core/mm2Property.js \
  ../../core/mm3Types.js \
  ../../core/mm4Method.js \
  ../../core/mm6Misc.js \
  ../../js/foam/ui/Window.js \
  ../../core/value.js \
  ../../core/view.js \
  ../../core/layout.js \
  ../../core/cview.js \
  ../../core/cview2.js \
  ../../core/RichTextView.js \
  ../../core/listchoiceview.js \
  ../../core/scroll.js \
  ../../core/mlang.js \
  ../../core/QueryParser.js \
  ../../core/search.js \
  ../../core/async.js \
  ../../core/oam.js \
  ../../core/visitor.js \
  ../../core/messaging.js \
  ../../core/dao.js \
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
  ../../core/ChromeApp.js \
  ../../core/../apps/mailreader/view.js \
  ../../core/../apps/mailreader/email.js \
  ../../core/../lib/email/email.js \
  ../../core/turntable.js \
  ../../core/CORE.js \
  ../../js/foam/lib/bookmarks/Bookmark.js \
  ../../js/foam/lib/bookmarks/AddBookmarksDialog.js \
  ../../lib/bookmarks/bookmark.js \
  ../../js/foam/ui/md/AppController.js \
  ../../js/foam/ui/md/SharedStyles.js \
  ../../lib/mdui/view.js \
  ../../lib/gmail/ImportedModels.js \
  ../../lib/gmail/dao.js \
  gmail.js \
  compose.js \
  > "$BUILD_DIR/foam.js"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"

#  ../../core/ChromeStorage.js \
#  ../../demos/benchmark_data.json \
#  ../../demos/photo.js \
