CLASS({
  package: 'foam.core.dao',
  name: 'StripPropertiesDAO',
  extendsModel: 'ProxyDAO',
  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'propertyNames'
    }
  ],
  methods: {
    process_: function(obj) {
      obj = obj.clone();
      for ( var i = 0 ; i < this.propertyNames.length ; i++ ) {
        obj.clearProperty(this.propertyNames[i]);
      }
      return obj;
    },
    select: function(sink, options) {
      sink = sink || [].sink;
      var self = this;
      var future = afuture();

      this.SUPER({
        put: function(obj, _, fc) {
          sink.put && sink.put(self.process_(obj), null, fc);
        },
        error: function() {
          sink.error && sink.error.apply(sink, arguments);
        },
        eof: function() {
          sink.eof && sink.eof();
        }
      }, options)(function() {
        future.set(sink);
      });

      return future.get;
    }
  }
});
