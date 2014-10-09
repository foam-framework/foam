MODEL({
  name: 'KeywordsTrait',

  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'keywords',
      preSet: function(_, a) {
        for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
        a.sort();
        return a;
      }
    }
  ]
});


MODEL({
  name: 'KeywordDAO',

  extendsModel: 'ProxyDAO',

  methods: {
    select: function(sink, options) {
      var query = options && options.query;

      if ( ! query ) return this.delegate.select(sink, options);

      var arg1;

      var dao = this;

      var newSink = {
        __proto__: sink,
        put: function(obj) {
          if ( ! query.f(obj) ) {
            console.log('******* KEYWORD MATCH: ', obj.id, query.toString(), arg1);
            dao.X.setTimeout(function() {
              obj = obj.model_.create(obj);
              obj.keywords = obj.keywords.clone().binaryInsert(arg1);
              console.log('* ', obj.keywords);
              dao.delegate.put(obj);
            }, 1000);
          }
          sink.put.apply(sink, arguments);
        }
      };

      // TODO(kgr): This is a bit hackish, replace with visitor support
      DefaultQuery.getPrototype().partialEval = function() {
        var q = DefaultQuery.create(this);
        // console.log('**** ', this.arg1);
        arg1 = this.arg1.intern();
        return q;
      };
      var newQuery = query.partialEval();
      delete DefaultQuery.getPrototype()['partialEval'];

      var newOptions = {
        __proto__: options,
        query: newQuery
      };

      return this.delegate.select(newSink, newOptions);
    }
  }
});
