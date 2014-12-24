CLASS({
  package: 'foam.core.dao',
  name: 'CloningDAO',
  extendsModel: 'ProxyDAO',
  methods: {
    select: function(sink, options) {
      sink = sink || [].sink;
      var future = afuture();
      this.delegate.select({
        put: function(obj, s, fc) {
          obj = obj.deepClone();
          sink.put && sink.put(obj, s, fc);
        },
        error: function() {
          sink.error && sink.error.apply(sink, argumentS);
        },
        eof: function() {
          sink.eof && sink.eof();
          future.set(sink);
        }
      }, options);
      return future.get;
    }
  }
});
