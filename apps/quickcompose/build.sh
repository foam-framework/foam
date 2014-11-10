export BUILD_DIR=~/Downloads/quickcompose
rm -rf $BUILD_DIR
cp -r . $BUILD_DIR
cp ../../core/foam.css $BUILD_DIR
cp ../saturn/contacts.css $BUILD_DIR
echo 'console.time("load_foam");' > prefix.js
echo 'console.timeEnd("load_foam");' > postfix.js
# echo 'console.profile();' > prefix.js
# echo 'console.profileEnd();' > postfix.js

cat \
  prefix.js \
  ../../core/stdlib.js \
  ../../core/io.js \
  ../../core/writer.js \
  ../../core/socket.js \
  ../../core/hash.js \
  ../../core/base64.js \
  ../../core/utf8.js \
  ../../core/parse.js \
  ../../core/event.js \
  ../../core/JSONUtil.js \
  ../../core/XMLUtil.js \
  ../../core/context.js \
  ../../core/FOAM.js \
  ../../core/JSONParser.js \
  ../../core/TemplateUtil.js \
  ../../core/async.js \
  ../../core/oam.js \
  ../../core/FObject.js \
  ../../core/BootstrapModel.js \
  ../../core/mm1Model.js \
  ../../core/mm2Property.js \
  ../../core/mm3Types.js \
  ../../core/mm4Method.js \
  ../../core/mm5Misc.js \
  ../../core/value.js \
  ../../core/view.js \
  ../../core/layout.js \
  ../../core/daoView.js \
  ../../core/ChoiceView.js \
  ../../core/DetailView.js \
  ../../core/TableView.js \
  ../../core/cview.js \
  ../../core/cview2.js \
  ../../core/MementoMgr.js \
  ../../core/listchoiceview.js \
  ../../core/scroll.js \
  ../../core/mlang.js \
  ../../core/glang.js \
  ../../core/QueryParser.js \
  ../../core/search.js \
  ../../core/visitor.js \
  ../../core/dao.js \
  ../../core/ChromeStorage.js \
  ../../core/arrayDAO.js \
  ../../core/diff.js \
  ../../core/SplitDAO.js \
  ../../core/index.js \
  ../../core/RichTextView.js \
  ../../core/DAOController.js \
  ../../core/ThreePaneController.js \
  ../../core/experimental/protobufparser.js \
  ../../core/experimental/protobuf.js \
  ../../core/models.js \
  ../../core/oauth.js \
  ../../core/touch.js \
  ../../core/ChromeApp.js \
  ../../core/CORE.js \
  ../mailreader/view.js \
  ../../lib/email/email.js \
  ../mailreader/email.js \
  ../saturn/EMailBodyDAO.js \
  ../saturn/contacts.js \
  postfix.js \
  > "$BUILD_DIR/foam.js"

rm prefix.js postfix.js

# For code compression, uncomment the following line:
# Install from: https://github.com/mishoo/UglifyJS
# cd ~; git clone git://github.com/mishoo/UglifyJS.git
#~/UglifyJS/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"
#~/UglifyJS/bin/uglifyjs --max-line-len 100 --no-seqs -nm -ns --overwrite "$BUILD_DIR/foam.js"
