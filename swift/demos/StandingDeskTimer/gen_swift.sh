#!/bin/bash
#
# Generates Swift classes from FOAM models and builds the xcode file.
# For local development, use this instead of rungyp.sh

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
        foam.swift.ui.FoamUILabel \
        foam.swift.ui.FoamEnumUILabel \
        foam.swift.ui.FoamUISwitch \
        foam.swift.ui.FoamUITextField \
        foam.swift.ui.FoamFloatUITextField \
        StandingDeskTimerDetailView \
      "
