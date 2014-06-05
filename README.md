# FOAM

## Feature Oriented Active Modeller

FOAM is a full-stack Reactive MVC Meta-Programming framework.

While it is written in Javascript, it can be used to generate code for any
language or platform.

There is nothing to build.  Just load any of the various .html demos.

  * Documentation: [Wiki](https://github.com/foam-framework/foam/wiki)

  * Developer Discussion: [foam-framework-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/foam-framework-discuss)

  * [Website](http://foam-framework.github.io/foam/)

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
