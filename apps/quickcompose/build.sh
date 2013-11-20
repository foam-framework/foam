export BUILD_DIR=~/Downloads/quickcompose
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR
cat \
  ../../core/stdlib.js \
  ../../core/io.js \
  ../../core/writer.js \
  ../../core/socket.js \
  ../../core/hash.js \
  ../../core/base64.js \
  ../../core/utf8.js \
  ../../core/parse.js \
  ../../core/context.js \
  ../../core/event.js \
  ../../core/JSONUtil.js \
  ../../core/XMLUtil.js \
  ../../core/FOAM.js \
  ../../core/TemplateUtil.js \
  ../../core/async.js \
  ../../core/ChromeApp.js \
  ../../core/AbstractPrototype.js \
  ../../core/ModelProto.js \
  ../../core/mm1Model.js \
  ../../core/mm2Property.js \
  ../../core/mm3Types.js \
  ../../core/mm4Method.js \
  ../../core/mm5Misc.js \
  ../../core/mm6Protobuf.js \
  ../../core/view.js \
  ../../core/listchoiceview.js \
  ../../core/scroll.js \
  ../../core/mlang.js \
  ../../core/glang.js \
  ../../core/QueryParser.js \
  ../../core/search.js \
  ../../core/visitor.js \
  ../../core/dao.js \
  ../../core/diff.js \
  ../../core/SplitDAO.js \
  ../../core/index.js \
  ../../core/StackView.js \
  ../../core/DAOController.js \
  ../../core/ThreePaneController.js \
  ../../core/experimental/protobufparser.js \
  ../../core/experimental/protobuf.js \
  ../../core/models.js \
  ../mailreader/view.js \
  ../mailreader/email.js \
  ../saturn/EMailBodyDAO.js \
  ../saturn/contacts.js \
  > "$BUILD_DIR/foam.js"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"
