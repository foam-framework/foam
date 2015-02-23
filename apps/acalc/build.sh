BASEDIR=$(dirname "$0")
cd "$BASEDIR"

#   Templates.js \

export BUILD_DIR=~/Downloads/acalc
rm -rf $BUILD_DIR
mkdir $BUILD_DIR
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
  Opt.js \
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
  ../../js/foam/ui/SlidePanel.js \
  ../../core/AbstractDAOView.js \
  ../../js/foam/ui/DAOListView.js \
  ../../js/foam/ui/DetailView.js \
  ../../js/foam/patterns/ChildTreeTrait.js \
  ../../js/foam/graphics/AbstractCViewView.js \
  ../../js/foam/graphics/PositionedCViewView.js \
  ../../js/foam/graphics/CView.js \
  ../../js/foam/graphics/Circle.js \
  ../../js/foam/graphics/CViewView.js \
  ../../js/foam/ui/md/Halo.js \
  ../../js/foam/graphics/ActionButtonCView.js \
  ../../core/HTMLParser.js \
  ../../core/visitor.js \
  ../../core/dao.js \
  ../../core/arrayDAO.js \
  ../../core/touch.js \
  ../../js/foam/ui/animated/Label.js \
  ../../js/foam/ui/md/Flare.js \
  ../../js/foam/i18n/Visitor.js \
  ../../js/foam/i18n/MessagesBuilder.js \
  ../../js/foam/i18n/ChromeMessagesBuilder.js \
  ../../js/foam/i18n/ChromeMessagesExtractor.js \
  ../../js/foam/i18n/GlobalController.js \
  CalcConfig.js \
  Calc.js \
  | sed 's/^ *//g' \
  | sed 's/  */ /g' \
  | sed 's%^//.*%%g' \
  | sed 's% //.*%%g' \
  | sed '/^$/d' \
  | sed 's/ *( */(/g' \
  | sed 's/ *) */)/g' \
  | sed 's/ *{ */{/g' \
  | sed 's/ *= */=/g' \
  | sed 's/ *: */:/g' \
  | sed 's/ *, */,/g' \
  | sed 's/ *; */;/g' \
  | sed 's/ *< */</g' \
  | sed 's/! /!/g' \
  | sed 's/ + /+/g' \
  | sed 's/ *? */?/g' \
  | sed 's/ *|| */||/g' \
  | sed ':a;N;$!ba;s/\n/_NL_/g' \
  | perl -pe 's#_NL_/\*.*?\*/##g' \
  | sed 's/_NL_}/}/g' \
  | sed 's/{_NL_/{/g' \
  | sed 's/,_NL_/,/g' \
  | sed 's/_NL_/\n/g' \
  > "$BUILD_DIR/foam.js"

# Delete unneeded files
rm -f \
  "$BUILD_DIR/Calc.js" \
  "$BUILD_DIR/Calc.html" \
  "$BUILD_DIR/Opt.js" \
  "$BUILD_DIR/Tests.js" \
  "$BUILD_DIR/Tests.html" \
  "$BUILD_DIR/build.sh" \
  "$BUILD_DIR/package.sh" \
  "$BUILD_DIR/*~" \

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"
