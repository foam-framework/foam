#!/bin/sh

BASEDIR=$(dirname $0)
sh "$BASEDIR"/build.sh

cd ~/Downloads/acalc
rm Tests.js Tests.html build.sh package.sh *~

zip -r acalc.zip *

echo "Constructed acalc.zip: " $HOME/Downloads/acalc/acalc.zip
