BASEDIR=$(dirname "$0")
cd "$BASEDIR"
export NAME="pcalc"
export BUILD_DIR=~/Downloads/$NAME

if [ ! -d ../../bower_components/paper-button ]; then
    pushd ../../
    sh ./get-polymer.sh > /dev/null
    popd
fi

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
  ../../js/foam/ui/Window.js \
  ../../core/value.js \
  ../../core/view.js \
  ../../core/view2.js \
  ../../core/layout.js \
  ../../js/foam/ui/SlidePanel.js \
  ../../core/AbstractDAOView.js \
  ../../core/DAOListView.js \
  ../../core/DetailView.js \
  ../../js/foam/patterns/ChildTreeTrait.js \
  ../../js/foam/graphics/AbstractCViewView.js \
  ../../js/foam/graphics/PositionedCViewView.js \
  ../../js/foam/graphics/CViewView.js \
  ../../js/foam/graphics/ActionButtonCView.js \
  ../../js/foam/graphics/CView.js \
  ../../js/foam/graphics/Circle.js \
  ../../js/foam/ui/md/Halo.js \
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
  ../../js/foam/ui/polymer/View.js \
  ../../js/foam/ui/polymer/gen/View.js \
  ../../js/foam/ui/polymer/gen/AutoBinding.js \
  ../../js/foam/ui/polymer/gen/PaperShadow.js \
  ../../js/foam/ui/polymer/gen/PaperRipple.js \
  ../../js/foam/ui/polymer/gen/PaperButtonBase.js \
  ../../js/foam/ui/polymer/gen/PaperButton.js \
  ../../js/foam/ui/polymer/ActionButton.js \
  CalcConfig.js \
  ../acalc/Calc.js \
  | sed 's/^ *//g' \
  | sed 's/  */ /g' \
  | sed 's%^//.*%%g' \
  | sed 's% //.*%%g' \
  | sed '/^$/d' \
  | sed 's/ *( */(/g' \
  | sed 's/ *) */)/g' \
  | sed 's/ *{ */{/g' \
  | sed 's/ *} */}/g' \
  | sed 's/ *= */=/g' \
  | sed 's/ *: */:/g' \
  | sed 's/ *, */,/g' \
  | sed 's/ *; */;/g' \
  | sed 's/ *< */</g' \
  | sed 's/ *> */>/g' \
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
  > "./foam.js"

export LINKS=(
  "../acalc/fonts"
  "../acalc/icons"
  "../acalc/_locales"
)

for LINK in ${LINKS[@]}; do
  ln -s $LINK ./
done
vulcanize --inline --csp -o AppCalc.html AppCalc_.html
for LINK in ${LINKS[@]}; do
  rm $(basename $LINK)
done

export FILES=(
  "../acalc/Calc.html"
  "../acalc/bg.js"
  "../acalc/Calc.js"
  "../acalc/fonts"
  "../acalc/icons"
  "../acalc/_locales"
  "CalcConfig.js"
  "AppCalc.html"
  "AppCalc.js"
  "manifest.json"
)

rm -rf $BUILD_DIR
mkdir $BUILD_DIR
for FILE in ${FILES[@]}; do
  cp -r $FILE $BUILD_DIR/
done

# Delete unneeded files
rm -f \
  "foam.js" \
  "AppCalc.html" \
  "AppCalc.js"

# For code compression, uncomment the following line:
# ~/node_modules/uglify-js/bin/uglifyjs --overwrite "$BUILD_DIR/foam.js"
