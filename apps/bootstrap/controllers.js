// TODO: Not being notified of changes to arrays

CLASS({
  name: 'AppController',
  extends: 'foam.ui.View',
  traits: ['DynamicViewListenerTrait'],
  requires: [
    'AppConfig',
    'AppManifest',
    'WindowConfig',
    'foam.ui.DetailView',
    'TextAreaValueView'
  ],

  properties: [
    {
      type: 'AppConfig',
      name: 'appConfig',
      view: 'foam.ui.DetailView',
      factory: function() {
        return AppConfig.create();
      }
    },
    {
      type: 'StringArray',
      name: 'appConfigSources',
      getter: function() {
        var ac = this.appConfig;
        return (ac && ac.sources) ? ac.sources : [];
      }
    },
    {
      type: 'AppManifest',
      name: 'appManifest',
      view: 'foam.ui.DetailView',
      factory: function() {
        return AppManifest.create({ appConfig: this.appConfig });
      }
    },
    {
      type: 'WindowConfig',
      name: 'windowConfig',
      view: 'foam.ui.DetailView',
      factory: function() {
        return WindowConfig.create({ appConfig: this.appConfig });
      }
    }
  ],

  templates: [
    function toHTML() {/*
                        <div id="{{{this.id}}}">
                        $$appConfig
                        $$appManifest
                        $$windowConfig
                        <hr />
                        $$appConfig{
                        model_: 'TextAreaValueView',
                        valueViewModel: 'RawSetupSh'
                        }
                        $$appConfig{
                        model_: 'TextAreaValueView',
                        valueViewModel: 'RawBuildSh'
                        }
                        $$appManifest{
                        model_: 'TextAreaValueView',
                        valueViewModel: 'RawManifestView'
                        }
                        $$windowConfig{
                        model_: 'TextAreaValueView',
                        valueViewModel: 'RawBackgroundPage'
                        }
                        </div>
                        */}
                       /*
                        $$appConfigSources{
                        model_: 'ArrayListView',
                        listView: 'TextAreaValueView',
                        listViewProperties: { valueViewModel: 'RawExtraPage' }
                        }
                        */
  ]
});
