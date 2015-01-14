#!/bin/bash

NPM=`which npm`
BOWER=`which bower`

if [ "$NPM" == "" ]; then
    echo "Attempting to install npm. You may be asked for your password."
    sudo apt-get install npm || return $?
fi
NPM=`which npm`

if [ "$BOWER" == "" ]; then
    echo "Attempting to install Bower. You may be asked for your password."
    sudo $NPM install -g bower || return $?
fi
BOWER=`which bower`

$BOWER install Polymer/polymer
$BOWER install Polymer/paper-elements
