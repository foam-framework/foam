#!/bin/bash
# Generates Swift classes from FOAM models.

cd $(dirname $0) || exit 1

# Generate the FOAM classes.
mkdir -p Generated
rm Generated/*

CLASS_PATH=./js

node --harmony ../../../tools/foam.js \
     --classpath "$CLASS_PATH" \
     --flags debug,swift,compiletime \
      foam.tools.GenSwift \
      outfolder="Generated" \
      names=" \
        foam.demos.StandingDeskTimer \
        StandingDeskTimerDetailView \
      "
