#!/bin/bash

# Builds the latest FOAM front-page website from in the foam/ directory.
# It lives in js/foam/apps/mainsite/Site.js.
MYDIR=`dirname $PWD/$0`
OUTPUTDIR=$MYDIR/temp
FOAMDIR=$MYDIR/../../foam

mkdir -p $OUTPUTDIR
nodejs $FOAMDIR/tools/foam.js foam.build.BuildApp \
    controller=foam.apps.mainsite.Site \
    targetPath=$OUTPUTDIR

cp $OUTPUTDIR/foam.js $MYDIR/../live-example.js

