CLASS({
  package: 'foam.u2',
  name: 'EIDProperty',
  extendsModel: 'Property',
  help: 'Describes a property used to store a DOM element id.',

  properties: [
    {
      name: 'lazyFactory',
      defaultValue: function() { return this.nextID(); }
    },
    {
      name: 'transient',
      defaultValue: true
    },
    {
      name: 'hidden',
      defaultValue: true
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$el', function() {
          return this.X.$(this[prop.name]);
        });
      }
    }
  ]
});
