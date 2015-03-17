#!/bin/sh

BASEDIR=$(dirname "$0")
cd "$BASEDIR"

BUILD_DIR="$BASEDIR"

cd ../../
node --harmony tools/foam.js foam.build.BuildApp controller=foam.apps.mbug.MBug defaultView=foam.ui.layout.MobileWindow coreFiles=stdlib,async,parse,event,JSONUtil,XMLUtil,context,JSONParser,TemplateUtil,FOAM,FObject,BootstrapModel,mm1Model,mm2Property,mm3Types,mm4Method,mm5Misc,../js/foam/ui/Window,value,view,../js/foam/ui/FoamTagView,HTMLParser,mlang,mlang2,QueryParser,visitor,messaging,dao,dao2,arrayDAO,index,models,oauth extraModels=foam.ui.RelationshipView "targetPath=$BUILD_DIR" precompileTemplates

cp core/foam.css "$BUILD_DIR"/foam.css

cd "$BUILD_DIR"
# Code compression.
uglifyjs foam.js -c unused=false > foam-min.js
mv foam-min.js foam.js
