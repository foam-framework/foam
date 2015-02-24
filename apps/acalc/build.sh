BASEDIR=$(dirname "$0")
cd "$BASEDIR"

#   Templates.js \

export BUILD_DIR=~/Downloads/acalc
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

cp manifest.json "$BUILD_DIR"
cp -r _locales "$BUILD_DIR"
cp -r icons "$BUILD_DIR"
cp bg.js "$BUILD_DIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp controller=Calc defaultView=foam.apps.calc.CalcView coreFiles=stdlib,async,parse,event,JSONUtil,XMLUtil,context,JSONParser,TemplateUtil,../apps/acalc/Opt,FOAM,FObject,BootstrapModel,mm1Model,mm2Property,mm3Types,mm4Method,mm5Misc,value,view,AbstractDAOView,DAOListView,DetailView,HTMLParser,visitor,dao,arrayDAO,touch,../js/foam/ui/Window extraFiles=../apps/acalc/Calc "targetPath=$BUILD_DIR" precompileTemplates


cd "$BUILD_DIR"
# Code compression.
uglifyjs foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
mv main.html AppCalc.html
