CLASS({
  name: 'ValueView',
  extends: 'foam.ui.View',

  properties: [
    { name: 'label', defaultValue: 'Value' },
    { name: 'data' }
  ],

  templates: [
    function toText() {/* <%= this.data.toString() %> */}
  ]
});

CLASS({
  name: 'RawManifestView',
  extends: 'ValueView',
  requires: [
    'AppManifest'
  ],

  properties: [
    {
      name: 'label',
      getter: function() {
        return this.data.appConfig.name + ': manifest.json';
      }
    },
    {
      type: 'AppManifest',
      name: 'data',
      factory: function() {
        return AppManifest.create();
      }
    }
  ],

  templates: [{ name: 'toText' }]
});

CLASS({
  name: 'RawBackgroundPage',
  extends: 'ValueView',
  requires: [
    'WindowConfig'
  ],

  properties: [
    {
      name: 'label',
      getter: function() {
        var ac = this.data.appConfig;
        return ac.name + ': ' + ac.backgroundSource;
      }
    },
    {
      type: 'WindowConfig',
      name: 'data',
      factory: function() {
        return WindowConfig.create();
      }
    }
  ],

  templates: [{ name: 'toText' }]
});

CLASS({
  name: 'RawSetupSh',
  extends: 'ValueView',
  requires: [
    'AppConfig'
  ],

  properties: [
    {
      name: 'label',
      getter: function() {
        var ac = this.data;
        return ac.name + ': setup.sh';
      }
    },
    {
      type: 'AppConfig',
      name: 'data',
      factory: function() {
        return AppConfig.create();
      }
    }
  ],

  templates: [{ name: 'toText' }]
});

CLASS({
  name: 'RawBuildSh',
  extends: 'ValueView',
  requires: [
    'AppConfig'
  ],

  properties: [
    {
      name: 'label',
      getter: function() {
        var ac = this.data;
        return ac.name + ': build.sh';
      }
    },
    {
      type: 'AppConfig',
      name: 'data',
      factory: function() {
        return AppConfig.create();
      }
    }
  ],

  templates: [{ name: 'toText' }]
});

CLASS({
  name: 'DynamicViewListenerTrait',

  properties: [
    {
      name: 'data',
      postSet: function(prev, next) {
        if (prev && prev.removeListener) prev.removeListener(this.updateHTML);
        if (next && next.addListener) next.addListener(this.updateHTML);
      }
    }
  ],

  listeners: {
    updateHTML: function() {
      if ( ! this.$ ) return;
      this.$.outerHTML = this.toHTML();
      this.initHTML();
    }
  }
});

CLASS({
  name: 'TextAreaValueView',
  extends: 'foam.ui.View',
  traits: ['DynamicViewListenerTrait'],

  properties: [
    {
      name: 'data'
    },
    {
      type: 'String',
      name: 'valueViewModel',
      postSet: function() {
        if (this.valueViewModel) {
          arequire(this.valueViewModel)(function(model) {
            this.valueView = model.create({ data: this.data });
            this.updateHTML();
          }.bind(this));
        }
      }
    },
    {
      name: 'valueView',
      defaultValue: null
    }
  ],

  templates: [
    function toHTML() {/*<div id="%%id">
                        <% if (this.valueView) { %><label>{{{this.valueView.label}}}</label><br /><% } %>
                        <textarea style="margin-left: 20%; width: 80%; height: 300px"><% if (this.valueView) { %>{{{this.valueView.toText()}}}<% } %></textarea>
                        </div> */}
  ]
});
