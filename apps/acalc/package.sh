#!/bin/sh

BASEDIR=$(dirname $0)
sh "$BASEDIR"/build.sh
zip -r acalc.zip *

echo "Constructed acalc.zip: " $HOME/Downloads/acalc/acalc.zip
