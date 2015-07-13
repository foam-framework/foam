CLASS({
  package: 'foam.u2',
  name: 'EIDProperty',
  extendsModel: 'Property',
  help: 'Describes a property used to store a DOM element id.',

  constants: {
    NEXT_ID: function() {
      return 'view' + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    }
  },

  properties: [
    {
      name: 'lazyFactory',
      defaultValue: function() { return foam.u2.EIDProperty.NEXT_ID(); }
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
          return { get: function() {
            return this.X.$(this[prop.name]);
          }}});
      }
    }
  ]
});
