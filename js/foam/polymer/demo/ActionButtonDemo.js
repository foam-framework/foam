CLASS({
  name: 'ActionButtonDemo',
  package: 'foam.polymer.demo',
  extendsModel: 'View',
  requires: [
    'Action',
    'foam.polymer.ActionButton',
    'foam.polymer.demo.ActionState'
  ],
  imports: ['log'],

  properties: [
    {
      type: 'foam.polymer.demo.ActionState',
      name: 'data',
      view: 'foam.polymer.ActionButton',
      factory: function() { return {}; }
    },
    {
      type: 'Action',
      name: 'mainAction',
      factory: function() {
        return this.Action.create({
          label: 'Main Action',
          action: function() {
            this.log('Main action committed');
          }.bind(this),
          isAvailable: function() {
            return this.available;
          },
          isEnabled: function() {
            return this.enabled;
          }
        });
      }
    },
    {
      type: 'Action',
      name: 'toggleAvailable',
      factory: function() {
        return this.Action.create({
          label: 'Toggle Available',
          help: 'Make the "Main Action" button appear or disappear',
          action: function() {
            this.available = !this.available;
          }
        });
      }
    },
    {
      type: 'Action',
      name: 'toggleEnabled',
      factory: function() {
        return this.Action.create({
          label: 'Toggle Enabled',
          help: 'Enable or disable the "Main Action" button',
          action: function() {
            this.enabled = !this.enabled;
          }
        });
      }
    }
  ],

  templates: [
    function toHTML() {/*
      $$data{ action: this.toggleAvailable }
      $$data{ action: this.toggleEnabled }
      $$data{ action: this.mainAction }
    */}
  ]
});
