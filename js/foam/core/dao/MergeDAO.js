CLASS({
  package: 'foam.core.dao',
  name: 'MergeDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'mergeStrategy',
      required: true
    }
  ],

  methods: {
    put: function(obj, sink) {
      var self = this;
      this.delegate.find(obj.id, {
        put: function(oldValue) {
          aseq(
            function(ret) {
              self.mergeStrategy(ret, oldValue, obj);
            },
            function(ret, obj) {
              self.delegate.put(obj, sink);
            })();
        },
        error: function() {
          // TODO: Distinguish internal versus external errors.
          self.delegate.put(obj, sink);
        }
      });
    }
  }
});
