CLASS({
  name: 'AppConfig',
  properties: [
    {
      type: 'String',
      help: 'Name of the application.',
      name: 'name',
      defaultValue: 'My App'
    },
    {
      type: 'String',
      help: 'Path to FOAM source.',
      label: 'FOAM Source Directory',
      name: 'foamSourceDir',
      defaultValue: '../..'
    },
    {
      type: 'String',
      help: 'Path to app source.',
      label: 'App Source Directory',
      name: 'sourceDir',
      defaultValue: '.'
    },
    {
      type: 'String',
      help: 'Path to directory where code should be copied.',
      label: 'Build Directory',
      name: 'buildDir',
      defaultValue: '.'
    },
    {
      type: 'Boolean',
      help: 'Whether or not to rebuild the FOAM framework every time.',
      label: 'Build FOAM Every Time',
      name: 'rebuildFOAM',
      defaultValue: false
    },
    {
      type: 'Boolean',
      help: 'Whether or not to wipe out the build directory before building.',
      label: 'Clean Build Directory Before Building',
      name: 'cleanBeforeBuild',
      defaultValue: false
    },
    {
      type: 'StringArray',
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
      type: 'String',
      help: 'Main background page file name.',
      label: 'Background Page Source',
      name: 'backgroundSource',
      defaultValue: 'background_main.js'
    },
    {
      type: 'StringArray',
      help: 'Source files for booting FOAM.',
      label: 'FOAM CSS Files',
      name: 'foamCSS',
      factory: function() {
        return ['foam.css'];
      }
    },
    {
      type: 'StringArray',
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
      type: 'String',
      name: 'version',
      help: 'Version of the application.',
      factory: function() {
        return '0.1';
      }
    },
    {
      type: 'Int',
      name: 'manifestVersion',
      help: 'Version of the Chrome Apps manifest format.',
      factory: function() {
        return 2;
      }
    },
    {
      type: 'String',
      name: 'minimumChromeVersion',
      help: 'Minimum version of Chrome required for app to work.',
      factory: function() {
        return '37.0.0.0';
      }
    },
    {
      type: 'StringArray',
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
      type: 'String',
      name: 'windowID',
      help: 'Unique identifier for window.',
      factory: function() { return 'MyAppID'; }
    },
    {
      type: 'String',
      name: 'src',
      help: 'Name of source file to load in window.',
      factory: function() { return 'app.html'; }
    },
    {
      type: 'Int',
      name: 'width',
      help: 'Initial width of application window.',
      defaultValue: 1024
    },
    {
      type: 'Int',
      name: 'height',
      help: 'Initial height of application window.',
      defaultValue: 768
    },
    {
      type: 'Int',
      name: 'minWidth',
      help: 'Minimium width of application window.',
      defaultValue: 400
    },
    {
      type: 'Int',
      name: 'minHeight',
      help: 'Minimum height of application window.',
      defaultValue: 200
    }
  ]
});
