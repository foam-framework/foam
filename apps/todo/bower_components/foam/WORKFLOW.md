# FOAM Workflow

Some general points:

- Don't check in `build/*` to `master`, only in release branches.

## Bower Release

Bower releases are performed by creating a git tag of the form `vX.Y.Z-rc2` or similar. Bower sorts using semver ordering, meaning that `v1.3.0-rc4` comes **before** `v1.3.0`.

The workflow for creating a new Bower release based on `master` is as follows:

```
# on master branch
$ $EDITOR bower.json
# set the version number, following semver
$ git add bower.json
$ git commit -m 'Update to version 0.4.0'
$ git push

$ git checkout -b release
# This is a temporary branch that won't be pushed
$ grunt
$ git add build/foam*.js
$ git commit
$ git tag v0.4.0
$ git push origin v0.4.0

# and clean up
$ git checkout master
$ git branch -d release
```

Now there's a new tagged release, and Bower will pick it up shortly.

### Bugfix releases

Doing a small change bugfix release based on the old release is done somewhat differently.

First, note the (first five or six digits of the) commit hashes for any commits needed to fix the bugs.

```
$ git checkout v0.4.0
$ $EDITOR bower.json
# update the version to v0.4.1
$ git commit -a -m 'Updating Bower version to 0.4.1.'

$ git cherry-pick abcdef
# repeat for more commits...

$ git tag v0.4.1
$ git push origin v0.4.1
```

Note that tags and branches are identical under the hood: they're just pointers to commit hashes. The only difference between them is that they are separated into two groups. Having lots of tags is a lot less annoying than having lots of branches, hence the utility of the split.


