# FOAM

Build fully featured high performance apps in less time using FOAM.

  * Application Speed
  * Application Size
  * Developer Efficiency

"Fast apps Fast"

[http://foamdev.com](http://foamdev.com)

## Feature Oriented Active Modeller

FOAM is a full-stack reactive MVC metaprogramming framework.

While it is written in Javascript, it can be used to generate code for any
language or platform.

There is nothing to build.  Just load any of the various .html demos.

  * Documentation: [Wiki](https://github.com/foam-framework/foam/wiki)

  * Developer Discussion: [foam-framework-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/foam-framework-discuss)

  * [Website](http://foam-framework.github.io/foam/)

  * [Demos](http://foam-framework.github.io/foam/foam/demos/DemoCat.html)

<!--
## Testing

FOAM has automated tests that can be run with `npm test`. This depends only on a working Node.js and `npm`.

There is also a pre-commit hook in `hooks/pre-commit`; it can be installed by running `hooks/install.sh` one time. Then the tests will run before any `git commit` and block the commit if they're failing.

Regression tests whose output has legitimately changed can be conveniently updated using the test page. That works as follows:
```
nodejs tests/server.js
```
and then navigate to [http://localhost:8888/tests/FOAMTests.html](http://localhost:8888/tests/FOAMTests.html).

Any failed regression test will highlight its results with red borders, and the "Update Master" button will write the test's latest results into the master. This edits `tests/FUNTests.xml`, which you should then check in. **Be careful to make sure the new output of the test is actually valid!**

### UI Testing

A small subset of tests require human oversight. These can be run using the server (see above) and then navigating to [http://localhost:8888/tests/FOAMTests.html?ui=1](http://localhost:8888/tests/FOAMTests.html?ui=1) to see just the UI tests.

The `?ui=1` parameter shows only tests with the `'ui'` tag.
-->

## Bundled Javascript Files

FOAM can bootstrap itself at runtime using `core/bootFOAM.js` and friends.

However, we have a script that will build a combined and minified `foam.js` and
`foam.html`, which make for easy and efficient deployment.

The simplest case of running the build tool is to run

```
nodejs tools/foam.js foam.build.BuildApp controller=my.controller.Model targetPath=.
```

But there are many more options you can configure. See [BuildApp.js](https://github.com/foam-framework/foam/tree/master/js/foam/build/BuildApp.js)
for the complete set of options and flags, and the various `build.sh` scripts in
the repo for examples of real usage.

### Contributing

Before contributing code to FOAM, you must complete the [Google Individual Contributor License Agreement](https://cla.developers.google.com/about/google-individual?csw=1).
