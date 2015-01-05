CLASS({
  name: 'ActionButton',
  package: 'foam.ui.polymer',

  extendsModel: 'ActionButton',
  traits: [
    'foam.ui.polymer.View'
  ],
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
    },
    {
      model_: 'BooleanProperty',
      name: 'raised',
      defaultValue: false,
      postSet: function(prev, next) {
        this.updateAttribute('raised', prev, next);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'recenteringTouch',
      defaultValue: false,
      postSet: function(prev, next) {
        this.updateAttribute('recenteringTouch', prev, next);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'fill',
      defaultValue: true,
      postSet: function(prev, next) {
        this.updateAttribute('fill', prev, next);
      }
    }
  ],

  constants: {
    HREF: '/bower_components/paper-button/paper-button.html',
    POLYMER_PROPERTIES: [
      'raised',
      'recenteringTouch',
      'fill'
    ]
  },

  templates: [
    function CSS() {/*
      paper-button { display: none; }
      paper-button.actionButton { display: none; }
      paper-button.available { display: inline-block; }
    */}
  ]
});
