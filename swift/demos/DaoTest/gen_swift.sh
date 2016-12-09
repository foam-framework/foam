#!/bin/bash
# Generates Swift classes from FOAM models.

cd $(dirname $0) || exit 1

# Generate the FOAM classes.
rm DaoPlayground.playground/Sources/*
cp ../../foam/* DaoPlayground.playground/Sources/

CLASS_PATH=../../../java/demos/DaoTest/js

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags debug,swift,compiletime \
      foam.tools.GenSwift \
      outfolder="DaoPlayground.playground/Sources" \
      names=" \
        tests.TestModel \
      "
