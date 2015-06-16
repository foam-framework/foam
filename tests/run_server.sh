#!/bin/bash

NODE=`which nodejs`
if [ -z "$NODE" ]; then
  NODE=`which node`
fi

$NODE --harmony ../tools/foam.js foam.testing.TestServer
