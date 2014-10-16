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

  properties: [
    {
      name: 'idMap',
      factory: function() { return {}; }
    }
    /*
      TODO: add a DAO for persisting keyword mappings
    {
      name: 'keywordsDAO'
    }
    */
  ],

  methods: {
    init: function() {
      this.SUPER();

      var keywords = this;
      var oldF     = DefaultQuery.f;

      DefaultQuery.f = function(obj) {
        return keywords.match(obj.id, this.arg1) || oldF.call(this, obj);
      };
    },

    addKeyword: function(id, keyword) {
      // console.log('******* addKeyword: ', id, keyword);
      var map = this.idMap[id] || ( this.idMap[id] = {} );
      map[keyword] = true;
    },

    removeKeywords: function(id) {
      delete this.idMap[id];
    },

    match: function(id, keyword) {
      var map = this.idMap[id];
      return map && map[keyword];
    },

    select: function(sink, options) {
      var query = options && options.query;

      if ( ! query ) return this.delegate.select(sink, options);

      var arg1;

      var keywords = this;

      var newSink = {
        __proto__: sink,
        put: function(obj) {
          if ( ! query.f(obj) ) keywords.addKeyword(obj.id, arg1);
          sink.put.apply(sink, arguments);
        }
      };

      // TODO(kgr): This is a bit hackish, replace with visitor support
      DefaultQuery.partialEval = function() {
        var q = DefaultQuery.create(this);
        // console.log('**** ', this.arg1);
        arg1 = this.arg1.intern();
        return q;
      };
      var newQuery = query.partialEval();
      delete DefaultQuery['partialEval'];

      var newOptions = { __proto__: options, query: newQuery };

      return this.delegate.select(newSink, newOptions);
    },

    remove: function(query, sink) {
      var key = obj[this.model.ids[0]] != undefined ? obj[this.model.ids[0]] : obj;
      this.removeKeywords(key);
      this.delegate.remove(query, sink);
    },
  }
});
