#!/bin/sh

BASEDIR=$(dirname $0)
sh "$BASEDIR"/build.sh

set -e
cd ~/Downloads/acalc
zip -r acalc.zip *

echo "Constructed acalc.zip: " $HOME/Downloads/acalc/acalc.zip
