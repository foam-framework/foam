CLASS({
  name: 'ActionButton',
  package: 'foam.polymer',

  extendsModel: 'ActionButton',
  traits: ['foam.polymer.PolymerComponentTrait'],
  requires: ['Action'],
  imports: ['warn'],

  properties: [
    {
      type: 'Action',
      name: 'action',
      factory: function() {
        return this.Action.create({
          action: function() {
            this.warn('Polymer button: action not set:', this);
            }.bind(this)
        });
      }
    },
    {
      name: 'className',
      defaultValue: ''
    },
    {
      name: 'tagName',
      defaultValue: 'paper-button'
    },
    {
      name: 'iconUrl',
      defaultValue: false
    }
  ],

  constants: {
    HREF: '/bower_components/paper-button/paper-button.html'
  },

  templates: [
    function CSS() {/*
      paper-button { display: none; }
      paper-button.actionButton { display: none; }
      paper-button.available { display: inline-block; }
    */}
  ]
});
