#!/bin/bash

BASE_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )
LINT_PATH=$1
if [ -z LINT_PATH ]; then
  LINT_PATH=BASE_DIR
fi

# Expand tabs to 8 spaces
find $1 -regex ".*\.\(html\|js\)" | xargs sed -i 's/\t/        /g'

# Remove trailing whitespaces
find $1 -regex ".*\.\(html\|js\)" | xargs sed -i 's/[[:space:]]*$//'
