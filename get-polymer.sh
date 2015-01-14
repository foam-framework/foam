#!/bin/bash

APT_GET=`which apt-get`
NODE=`which node`
NODEJS=`which nodejs`
NPM=`which npm`
BOWER=`which bower`

if [ "$APT_GET" != "" ]; then
  if [ "$NODEJS" == "" ]; then
    echo "Attempting to install nodejs. You may be asked for your password."
    sudo apt-get install nodejs
  fi
  NODEJS=`which nodejs`

  if [ "$NPM" == "" ]; then
    echo "Attempting to install npm. You may be asked for your password."
    sudo apt-get install npm || return $?
  fi
  NPM=`which npm`

  if [ "$NODE" == "" ]; then
    NODEJS_DIR=$(dirname ${NODEJS})
    echo "Attempting to symlink nodejs to node. You may be asked for your password."
    sudo ln -s $NODEJS $NODEJS_DIR/node
  fi
  NODE=`which node`

  if [ "$BOWER" == "" ]; then
    echo "Attempting to install Bower. You may be asked for your password."
    sudo $NPM install -g bower || return $?
  fi
  BOWER=`which bower`
else
  echo "You do not have apt-get. Attempting install ASSUMING you have bower (see http://bower.io)."
fi

$BOWER install Polymer/polymer
$BOWER install Polymer/paper-elements
