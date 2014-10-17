# FOAM

[http://foamdev.com](http://foamdev.com)

## Feature Oriented Active Modeller

FOAM is a full-stack Reactive MVC Meta-Programming framework.

While it is written in Javascript, it can be used to generate code for any
language or platform.

There is nothing to build.  Just load any of the various .html demos.

  * Documentation: [Wiki](https://github.com/foam-framework/foam/wiki)

  * Developer Discussion: [foam-framework-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/foam-framework-discuss)

  * [Website](http://foam-framework.github.io/foam/)

  * [Demos](http://foam-framework.github.io/foam/demos/DemoCat.html)

## Testing

FOAM has automated tests that can be run with `npm test`. This depends only on a working Node.js and `npm`.

There is also a pre-commit hook in `hooks/pre-commit`; it can be installed by running `hooks/install.sh` one time. Then the tests will run before any `git commit` and block the commit if they're failing.

Regression tests whose output has legitimately changed can be conveniently updated using the test page. That works as follows:
```
node --harmony tests/server.js
```
and then navigate to [http://localhost:8888/tests/FOAMTests.html](http://localhost:8888/tests/FOAMTests.html).

Any failed regression test will highlight its results with red borders, and the "Update Master" button will write the test's latest results into the master. This edits `tests/FUNTests.xml`, which you should then check in. **Be careful to make sure the new output of the test is actually valid!**

### UI Testing

A small subset of tests require human oversight. These can be run using the server (see above) and then navigating to [http://localhost:8888/tests/FOAMTests.html?ui=1](http://localhost:8888/tests/FOAMTests.html?ui=1) to see just the UI tests.

The `?ui=1` parameter shows only tests with the `'ui'` tag.

## Bundled Javascript Files

FOAM can bootstrap itself at runtime using `core/bootFOAM.js` and friends.

However, we have a Grunt script that will build a combined `foam.js` and minified `foam.min.js`, which make for easier deployment.

To get started with Grunt, you'll need [npm](http://nodejs.org). Then you can run:

```
sudo npm install -g grunt-cli
npm install
grunt
```

Currently these files are bloated by rarely-used optional features like Canvas views, Google protobuffer support, and others. We plan to cut these out into separate files eventually.
