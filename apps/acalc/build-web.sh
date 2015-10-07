BASEDIR=$PWD/$(dirname "$0")
cd "$BASEDIR"

#   Templates.js \

pushd .

export BUILD_DIR="$BASEDIR"/build-web
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

cp -r icons "$BUILD_DIR"

cd ../../
#node --harmony tools/foam.js foam.build.BuildApp controller=Calc defaultView=foam.apps.calc.CalcView coreFiles=stdlib,async,parse,event,JSONUtil,XMLUtil,context,JSONParser,TemplateUtil,FOAM,FObject,BootstrapModel,mm1Model,mm2Property,mm3Types,mm4Method,mm6Misc,value,view,../js/foam/grammars/CSS3,HTMLParser,visitor,dao,arrayDAO,../js/foam/ui/Window extraFiles=../apps/acalc/Calc "targetPath=$BUILD_DIR" precompileTemplates

node --harmony tools/foam.js foam.build.BuildApp appDefinition=foam.apps.calc.WebApp "targetPath=$BUILD_DIR"

cd "$BUILD_DIR"
# Code compression.
uglifyjs -b semicolons=false,beautify=false foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
popd
