BMODEL({
  name: 'KeywordDAO',

  extendsModel: 'ProxyDAO',

  methods: {
    select: function(sink, options) {
      var query = options && options.query;

      if ( ! query ) return this.delegate.select(sink, options);

      var oldClone = DefaultQuery.getPrototype().clone;
      var newClone = function() {
        console.log('********************************** ', this);
        return oldClone.apply(this, arguments);
      };
      
      var newQuery = query.deepClone();
      DefaultQuery.getPrototype().clone = oldClone;

      var newSink = {
        __proto__: sink,
        put: function(obj) {
          if ( ! query.f(obj) ) {
            console.log('******* KEYWORD MATCH: ', obj);
          }
          sink.put.apply(sink, arguments);
        }
      };
      var newOptions = {
        __proto__: options,
        query: newQuery
      };

      return this.delegate.select(sink, newOptions);
    }
  }
});