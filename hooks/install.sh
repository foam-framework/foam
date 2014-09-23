#!/bin/sh

# Installs the git hooks in a new repository.
# Simply copies the scripts into the .git/hooks directory.

REPO_DIR="`git rev-parse --show-toplevel`" || exit $?

cp $REPO_DIR/hooks/pre-commit $REPO_DIR/.git/hooks/pre-commit

