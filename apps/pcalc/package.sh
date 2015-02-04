#!/bin/sh

BASEDIR=$(dirname $0)
sh "$BASEDIR"/build.sh

set -e
cd ~/Downloads/pcalc
zip -r pcalc.zip *

echo "Constructed pcalc.zip: " $HOME/Downloads/pcalc/pcalc.zip
