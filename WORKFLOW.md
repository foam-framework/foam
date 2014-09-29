# FOAM Workflow

Some general points:

- Don't check in `build/*` to `master`, only in release branches.

## Testing

There are automatic console tests, and the testing page. There are also three kinds of tests, one currently unused.

### Automatic Testing

Use `npm test` from the root of the repository to run the automated tests manually. These load FOAM in a new Node.js instance and execute the tests, which are stored in `tests/FUNTests.xml`.

There is also a git pre-commit hook prepared in `hooks/pre-commit`, which will run the tests on every commit and block the commit if any tests are failing.

### Test Page

Alternatively, you can run `node --harmony tests/server.js`, navigate to [http://localhost:8888/tests/FOAMTests.html](), and look at the tests, with their code and results. Failed tests are highlighted with red borders. Regression tests (see below) are shown with the master on the left and the live results on the right. If they differ, the Update Master button is enabled and will write the live results into the master.

This edits the `tests/FUNTests.xml` file, which you should commit with your other changes, so that the tests in the repo are always passing.

### Test Types

`UnitTest` is the basic test. It has an `atest()` method which returns an afunc. A test can have children under the `tests` relationship; `atest()` will run the child tests when `runChildTests` is truthy (the default).

`UnitTest`s have `passed` and `failed` properties that count how many assertions passed and failed. They set `hasRun` after they have finished executing, and prevent themselves from being re-executed.

The other type of test in active use (as of 2014-09-23) is `RegressionTest`. This is a submodel of `UnitTest`, which adds a `master` property. Instead of using `ok()`, `fail()` and `assert()` to count passes and failures, a `RegressionTest` just logs information, and then compares its live log to a "gold master", stored in the `master` property. If they match (using `.equals()`) then the test passes; if they differ then it fails.

Updating the `master` is done with the testing page, as described above.

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


