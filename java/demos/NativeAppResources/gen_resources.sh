#!/bin/bash
# Generates resources that can be used in native apps.

cd $(dirname $0) || exit 1

mkdir -p AndroidGenerated
rm AndroidGenerated/*

mkdir -p iOSGenerated
rm iOSGenerated/*

CLASS_PATH=./js

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags java \
      foam.tools.GenAndroidStrings \
      outfile="AndroidGenerated/androidstrings.xml" \
      names=" \
        demo.DemoModel \
      "

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags java \
      foam.tools.GenAndroidConstants \
      outfile="AndroidGenerated/androidconstants.xml" \
      names=" \
        demo.DemoModel \
      "

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags swift,compiletime \
      demo.GenObjcH \
      outfolder="iOSGenerated" \
      names=" \
        demo.DemoModel \
      "

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags swift,compiletime \
      demo.GenObjcM \
      outfolder="iOSGenerated" \
      names=" \
        demo.DemoModel \
      "
