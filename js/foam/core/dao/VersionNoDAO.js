CLASS({
  package: 'foam.core.dao',
  name: 'VersionNoDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      transient: true
    },
    {
      model_: 'IntProperty',
      name: 'version',
      defaultValue: 1
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var future = afuture();
      this.WHEN_READY = future.get;

      // Scan all DAO values to find the largest
      this.delegate.select(MAX(this.property))(function(max) {
        if ( max.max ) this.version = max.max + 1;
        future.set(true);
      }.bind(this));
    },
    put: function(obj, sink) {
      this.WHEN_READY(function() {
        var val = this.property.f(obj);
        obj[this.property.name] = this.version++;
        this.delegate.put(obj, sink);
      }.bind(this));
    }
  }
});
