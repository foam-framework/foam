#!/bin/bash

TODO_DIR=$PWD/`dirname $0`
FOAM_DIR=$TODO_DIR/../..
OUT_DIR=$TODO_DIR/build

rm -rf $OUT_DIR
mkdir $OUT_DIR
node $FOAM_DIR/tools/foam.js foam.build.BuildApp targetPath=$TODO_DIR/build \
  controller=com.todomvc.Controller \
  htmlFileName=junk.html \
  extraModels=foam.ui.BooleanView,foam.ui.DetailView,foam.ui.ActionButton \
  extraClassPaths=$TODO_DIR/js

rm $OUT_DIR/junk.html
