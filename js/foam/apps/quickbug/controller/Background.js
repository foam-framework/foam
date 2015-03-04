CLASS({
  name: 'Background',
  package: 'foam.apps.quickbug.controller',

  requires: [
    'foam.apps.quickbug.model.QBug',
    'NullDAO'
  ],

  exports: [
    'metricDAO'
  ],

  properties: [
    {
      name: 'metricDAO',
      factory: function() {
        return this.NullDAO.create();
      }
    },
    {
      name: 'qb',
      factory: function() {
        return this.QBug.create();
      }
    }
  ],

  methods: {
    init: function() {
      if ( chrome.app && chrome.app.runtime ) {
        chrome.app.runtime.onLaunched.addListener(this.onLaunch);
        chrome.runtime.onMessageExternal.addListener(this.onMessageExternal);
      }
    },
  },
  listeners: [
    {
      name: 'onLaunched',
      code: function() {
        this.qb.launchBrowser.apply(this.qb, arguments);
      }
    },
    {
      name: 'onMessageExternal',
      code: function(msg) {
        if ( msg && msg.type === 'openUrl' ) {
          // Extract the project name and call launchBrowser.
          var start = msg.url.indexOf('/p/') + 3;
          var end = msg.url.indexOf('/', start);
          var project = msg.url.substring(start, end);
          this.onLaunched(project, msg.url);
        }
      }
    }
  }
});
