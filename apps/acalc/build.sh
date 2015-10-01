BASEDIR=$PWD/$(dirname "$0")
cd "$BASEDIR"

#   Templates.js \

pushd .

export BUILD_DIR=~/Downloads/acalc
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

cp manifest.json "$BUILD_DIR"
cp -r _locales "$BUILD_DIR"
cp -r icons "$BUILD_DIR"
cp bg.js "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp controller=Calc defaultView=foam.apps.calc.CalcView coreFiles=stdlib,async,parse,event,JSONUtil,XMLUtil,context,JSONParser,TemplateUtil,FOAM,FObject,BootstrapModel,mm1Model,mm2Property,mm3Types,mm4Method,mm6Misc,value,view,../js/foam/ui/AbstractDAOView,../js/foam/ui/DAOListView,../js/foam/ui/DetailView,../js/foam/grammars/CSS3,HTMLParser,visitor,dao,arrayDAO,../js/foam/ui/Window,../js/foam/i18n/IdGenerator,../js/foam/i18n/Visitor,../js/foam/i18n/MessagesExtractor,../js/foam/i18n/ChromeMessagesInjector,../js/foam/i18n/GlobalController extraFiles=../apps/acalc/Calc "targetPath=$BUILD_DIR" precompileTemplates

cd "$BUILD_DIR"
# Code compression.
uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js

mv main.html AppCalc.html
popd
