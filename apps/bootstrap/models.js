CLASS({
  name: 'AppConfig',
  properties: [
    {
      model_: 'StringProperty',
      help: 'Name of the application.',
      name: 'name',
      defaultValue: 'My App'
    },
    {
      model_: 'StringProperty',
      help: 'Path to FOAM source.',
      label: 'FOAM Source Directory',
      name: 'foamSourceDir',
      defaultValue: '../..'
    },
    {
      model_: 'StringProperty',
      help: 'Path to app source.',
      label: 'App Source Directory',
      name: 'sourceDir',
      defaultValue: '.'
    },
    {
      model_: 'StringProperty',
      help: 'Path to directory where code should be copied.',
      label: 'Build Directory',
      name: 'buildDir',
      defaultValue: '.'
    },
    {
      model_: 'BooleanProperty',
      help: 'Whether or not to rebuild the FOAM framework every time.',
      label: 'Build FOAM Every Time',
      name: 'rebuildFOAM',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      help: 'Whether or not to wipe out the build directory before building.',
      label: 'Clean Build Directory Before Building',
      name: 'cleanBeforeBuild',
      defaultValue: false
    },
    {
      model_: 'StringArrayProperty',
      help: 'Source files (not including main background page).',
      label: 'App Sources',
      name: 'sources',
      factory: function() {
        return [
          'models.js',
          'views.js',
          'controllers.js',
          'app.html'
        ];
      }
    },
    {
      model_: 'StringProperty',
      help: 'Main background page file name.',
      label: 'Background Page Source',
      name: 'backgroundSource',
      defaultValue: 'background_main.js'
    },
    {
      model_: 'StringArrayProperty',
      help: 'Source files for booting FOAM.',
      label: 'FOAM CSS Files',
      name: 'foamCSS',
      factory: function() {
        return ['foam.css'];
      }
    },
    {
      model_: 'StringArrayProperty',
      help: 'Source files for booting FOAM.',
      label: 'FOAM Sources',
      name: 'foamSources',
      factory: function() {
        return FOAM_SOURCES;
      }
    }
  ]
});

CLASS({
  name: 'AppManifest',

  properties: [
    {
      type: 'AppConfig',
      help: 'Global application configuration.',
      name: 'appConfig',
      hidden: true
    },
    {
      model_: 'StringProperty',
      name: 'version',
      help: 'Version of the application.',
      factory: function() {
        return '0.1';
      }
    },
    {
      model_: 'IntProperty',
      name: 'manifestVersion',
      help: 'Version of the Chrome Apps manifest format.',
      factory: function() {
        return 2;
      }
    },
    {
      model_: 'StringProperty',
      name: 'minimumChromeVersion',
      help: 'Minimum version of Chrome required for app to work.',
      factory: function() {
        return '37.0.0.0';
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'permissions',
      help: 'Raw data inserted in to permissions section of manifest.',
      issues: 'This should be modeled.',
      factory: function() {
        return ['webview'];
      }
    }
  ]
});

CLASS({
  name: 'WindowConfig',

  properties: [
    {
      type: 'AppConfig',
      help: 'Global application configuration.',
      name: 'appConfig',
      hidden: true
    },
    {
      model_: 'StringProperty',
      name: 'windowID',
      help: 'Unique identifier for window.',
      factory: function() { return 'MyAppID'; }
    },
    {
      model_: 'StringProperty',
      name: 'src',
      help: 'Name of source file to load in window.',
      factory: function() { return 'app.html'; }
    },
    {
      model_: 'IntProperty',
      name: 'width',
      help: 'Initial width of application window.',
      defaultValue: 1024
    },
    {
      model_: 'IntProperty',
      name: 'height',
      help: 'Initial height of application window.',
      defaultValue: 768
    },
    {
      model_: 'IntProperty',
      name: 'minWidth',
      help: 'Minimium width of application window.',
      defaultValue: 400
    },
    {
      model_: 'IntProperty',
      name: 'minHeight',
      help: 'Minimum height of application window.',
      defaultValue: 200
    }
  ]
});
