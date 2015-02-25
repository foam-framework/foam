/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'ProxyDAO',

  extendsModel: 'AbstractDAO',

  documentation: function() {/*
    Provides a proxy to the $$DOC{ref:'.delegate'} DAO, and allows swapping out the
    $$DOC{ref:'.delegate'} transparently
    to any listeners of this $$DOC{ref:'.'}.
  */},

  properties: [
    {
      name: 'delegate',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true,
      transient: true,
      documentation: "The internal DAO to proxy.",
      factory: function() { return NullDAO.create(); }, // TODO: use singleton
      postSet: function(oldDAO, newDAO) {
        if ( this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
          // FutureDAOs will put via the future. In that case, don't put here.
          if ( ! FutureDAO.isInstance(oldDAO) ) this.notify_('reset', []);
        }
      }
    },
    {
      model_: 'ModelProperty',
      name: 'model',
      type: 'Model',
      defaultValueFn: function() { return this.delegate.model; },
      documentation: function() { /*
          <p>Determines the expected $$DOC{ref:'Model'} type for the items
            in this $$DOC{ref:'DAO'}.</p>
          <p>The properties of the $$DOC{ref:'Model'} definition specified
            here may be used when filtering and indexing.</p>
      */}
    }
  ],

  methods: {
    relay: function() { /* Sets up relay for listening to delegate changes. */
      if ( ! this.relay_ ) {
        var self = this;

        this.relay_ = {
          put:    function() { self.notify_('put', arguments);    },
          remove: function() { self.notify_('remove', arguments); },
          reset: function() { self.notify_('reset', arguments); },
          toString: function() { return 'RELAY(' + this.$UID + ', ' + self.model_.name + ', ' + self.delegate + ')'; }
        };
      }

      return this.relay_;
    },

    put: function(value, sink) { /* Passthrough to delegate. */
      this.delegate.put(value, sink);
    },

    remove: function(query, sink) { /* Passthrough to delegate. */
      this.delegate.remove(query, sink);
    },

    removeAll: function() { /* Passthrough to delegate. */
      return this.delegate.removeAll.apply(this.delegate, arguments);
    },

    find: function(key, sink) { /* Passthrough to delegate. */
      this.delegate.find(key, sink);
    },

    select: function(sink, options) { /* Passthrough to delegate. */
      return this.delegate.select(sink, options);
    },

    listen: function(sink, options) { /* Passthrough to delegate, using $$DOC{ref:'.relay'}. */
      // Adding first listener, so listen to delegate
      if ( ! this.daoListeners_.length && this.delegate ) {
        this.delegate.listen(this.relay());
      }

      this.SUPER(sink, options);
    },

    unlisten: function(sink) { /* Passthrough to delegate, using $$DOC{ref:'.relay'}. */
      this.SUPER(sink);

      // Remove last listener, so unlisten to delegate
      if ( ! this.daoListeners_.length && this.delegate ) {
        this.delegate.unlisten(this.relay());
      }
    },

    toString: function() { /* String representation. */
      return this.name_ + '(' + this.delegate + ')';
    }
  }
});


/** A DAO proxy that delays operations until the delegate is set in the future. **/
CLASS({
  name: 'FutureDAO',

  extendsModel: 'ProxyDAO',

  documentation: function() {/*
    A DAO proxy that delays operations until the delegate is set, at some time in the future.
  */ },

  properties: [
    {
      name: 'delegate',
      factory: function() { return null; },
      postSet: function(oldDAO, newDAO) {
        if ( this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
        }
      }
    },
    {
      name: 'future',
      required: true,
      documentation: "The future on which to operate before the delegate becomes available."
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.delegate ? this.delegate.model : ''; },
      documentation: function() {/*
        The model type of the items in the delegate DAO. Empty if the future has not been set yet.
      */}
    }
  ],

  methods: {
    init: function() { /* Sets up the future to provide us with the delegate when it becomes available. */
      this.SUPER();

      this.future(function(delegate) {
        this.delegate = delegate;
      }.bind(this));
    },

    put: function(value, sink) { /* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        this.delegate.put(value, sink);
      } else {
        this.future(this.put.bind(this, value, sink));
      }
    },

    remove: function(query, sink) { /* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        this.delegate.remove(query, sink);
      } else {
        this.future(this.remove.bind(this, query, sink));
      }
    },

    removeAll: function() { /* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        return this.delegate.removeAll.apply(this.delegate, arguments);
      }

      var a = arguments;
      var f = afuture();
      this.future(function(delegate) {
        this.removeAll.apply(this, a)(f.set);
      }.bind(this));

      return f.get;
    },

    find: function(key, sink) {/* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        this.delegate.find(key, sink);
      } else {
        this.future(this.find.bind(this, key, sink));
      }
    },

    select: function(sink, options) {/* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        return this.delegate.select(sink, options);
      }

      var a = arguments;
      var f = afuture();
      this.future(function() {
        this.select.apply(this, a)(f.set);
      }.bind(this));

      return f.get;
    }
  }
});

/*
var dao = DelayedDAO.create({delegate: [1,2,3], initialDelay: 5000, rowDelay: 2000});
dao.select(console.log);
*/


/**
 * Set a specified properties value with an auto-increment
 * sequence number on DAO.put() if the properties value
 * is set to the properties default value.
 */
CLASS({
  name: 'SeqNoDAO',
  label: 'SeqNoDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      defaultValueFn: function() {
        return this.delegate.model ? this.delegate.model.ID : undefined;
      },
      transient: true
    },
    {
      model_: 'IntProperty',
      name: 'sequenceValue',
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
        if ( max.max ) this.sequenceValue = max.max + 1;
        future.set(true);
      }.bind(this));
    },
    put: function(obj, sink) {
      this.WHEN_READY(function() {
        var val = this.property.f(obj);

        if ( val == this.property.defaultValue ) {
          obj[this.property.name] = this.sequenceValue++;
        }

        this.delegate.put(obj, sink);
      }.bind(this));
    }
  }
});



CLASS({
  name: 'GUIDDAO',
  label: 'GUIDDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      defaultValueFn: function() {
        return this.delegate.model ? this.delegate.model.ID : undefined;
      },
      transient: true
    }
  ],

  methods: {
    createGUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },

    put: function(obj, sink) {
      if ( ! obj.hasOwnProperty(this.property.name) )
        obj[this.property.name] = this.createGUID();

      this.delegate.put(obj, sink);
    }
  }
});


CLASS({
  name: 'CachingDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'src'
    },
    {
      name: 'cache',
      help: 'Alias for delegate.',
      getter: function() { return this.delegate },
      setter: function(dao) { this.delegate = dao; }
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.src.model || this.cache.model; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var src   = this.src;
      var cache = this.cache;

      var futureDelegate = afuture();
      this.cache = FutureDAO.create({future: futureDelegate.get});

      src.select(cache)(function() {
        // Actually means that cache listens to changes in the src.
        src.listen(cache);
        futureDelegate.set(cache);
        this.cache = cache;
      }.bind(this));
    },
    put: function(obj, sink) { this.src.put(obj, sink); },
    remove: function(query, sink) { this.src.remove(query, sink); },
    removeAll: function(sink, options) { return this.src.removeAll(sink, options); }
  }
});


CLASS({
  name: 'FilteredDAO_',
  extendsModel: 'ProxyDAO',

  documentation: function() {/*
        <p>Internal use only.</p>
      */},

  properties: [
    {
      name: 'query',
      required: true
    }
  ],
  methods: {
    select: function(sink, options) {
      return this.delegate.select(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(this.query, options.query) :
          this.query
      } : {query: this.query});
    },
    removeAll: function(sink, options) {
      return this.delegate.removeAll(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(this.query, options.query) :
          this.query
      } : {query: this.query});
    },
    listen: function(sink, options) {
      return this.delegate.listen(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(this.query, options.query) :
          this.query
      } : {query: this.query});
    },
    toString: function() {
      return this.delegate + '.where(' + this.query + ')';
    }
  }

});


CLASS({
  name: 'OrderedDAO_',
  extendsModel: 'ProxyDAO',

  documentation: function() {/*
        <p>Internal use only.</p>
      */},

  properties: [
    {
      name: 'comparator',
      required: true
    }
  ],
  methods: {
    select: function(sink, options) {
      if ( options ) {
        if ( ! options.order )
          options = { __proto__: options, order: this.comparator };
      } else {
        options = {order: this.comparator};
      }

      return this.delegate.select(sink, options);
    },
    toString: function() {
      return this.delegate + '.where(' + this.comparator + ')';
    }
  }

});


CLASS({
  name: 'LimitedDAO_',
  extendsModel: 'ProxyDAO',

  documentation: function() {/*
        <p>Internal use only.</p>
      */},

  properties: [
    {
      name: 'count',
      required: true
    }
  ],
  methods: {
    select: function(sink, options) {
      if ( options ) {
        if ( 'limit' in options ) {
          options = {
            __proto__: options,
            limit: Math.min(this.count, options.limit)
          };
        } else {
          options = { __proto__: options, limit: this.count };
        }
      }
      else {
        options = { limit: this.count };
      }

      return this.delegate.select(sink, options);
    },
    toString: function() {
      return this.delegate + '.limit(' + this.count + ')';
    }
  }
});


CLASS({
  name: 'SkipDAO_',
  extendsModel: 'ProxyDAO',

  documentation: function() {/*
        <p>Internal use only.</p>
      */},

  properties: [
    {
      name: 'skip',
      required: true,
      postSet: function() {
        if ( this.skip !== Math.floor(this.skip) )
          console.warn('skip() called with non-integer value: ' + this.skip);
      }
    }
  ],
  methods: {
    select: function(sink, options) {
      if ( options ) {
        options = {
          __proto__: options,
          skip: this.skip
        };
      } else {
        options = { __proto__: options, skip: this.skip };
      }

      return this.delegate.select(sink, options);
    },
    toString: function() {
      return this.delegate + '.skip(' + this.skip + ')';
    }
  }
});

function atxn(afunc) {
  return function(ret) {
    if ( GLOBAL.__TXN__ ) {
      afunc.apply(this, arguments);
    } else {
      GLOBAL.__TXN__ = {};
      var a = argsToArray(arguments);
      a[0] = function() {
        GLOBAL.__TXN__ = undefined;
        ret();
      };
      afunc.apply(this, a);
    }
  };
}

CLASS({
  name: 'KeyCollector',
  help: "A sink that collects the keys of the objects it's given.",

  properties: [
    {
      name: 'keys',
      type: 'Array',
      factory: function() { return []; }
    }
  ],

  methods: {
    put: function(value) {
      this.keys.push(value.id);
    },
    remove: function(value) {
      this.keys.remove(value.id);
    }
  }
});


CLASS({
  name: 'WorkerDelegate',
  help:  'The client side of a web-worker DAO',

  properties: [
    {
      name:  'dao',
      label: 'DAO',
      type:  'DAO',
      required: 'true',
      postSet: function(oldVal, val) {
        if (oldVal) oldVal.unlisten(this);
        val.listen(this);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      self.addEventListener('message', this.onMessage);
    },
    put: function(obj) {
      self.postMessage({
        method: "put",
        obj: ObjectToJSON.visitObject(obj)
      });
    },
    remove: function(obj) {
      self.postMessage({
        method: "remove",
        key: obj.id
      });
    }
  },

  listeners: [
    {
      name: 'onMessage',
      code: function(e) {
        // This is a nightmare of a function, clean it up.
        var message = e.data;
        if ( !message.method ) return;
        var me = this;
        var params = message.params.model_ ?
          JSONToObject.visitObject(message.params) :
          message.params;
        if (message.method == "put") {
          this.dao.put(params, {
            put: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "remove") {
          this.dao.remove(params, {
            remove: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "select") {
          var request = JSONToObject.visit(message.params);
          var mysink = {
            __proto__: request.sink,
            eof: function() {
              request.sink.eof && request.sink.eof();
              self.postMessage({
                request: message.request,
                sink: ObjectToJSON.visit(this.__proto__)
              });
            },
            error: function() {
              request.sink.error && request.sink.error();
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          };
          this.dao.select(mysink, request.options);
        }
      }
    }
  ]
});


CLASS({
  name: 'OrderedCollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'comparator',
      type: 'Value',
      required: true
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.reduce(this.comparator, other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


CLASS({
  name: 'CollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      factory: function() { return []; }
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.concat(other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


CLASS({
  name: 'EasyDAO',
  extendsModel: 'ProxyDAO',

  help: 'A facade for easy DAO setup.',

  documentation: function() {/*
    <p>If you don't know which $$DOC{ref:'DAO'} implementation to choose, $$DOC{ref:'EasyDAO'} is
    ready to help. Simply <code>this.X.EasyDAO.create()</code> and set the flags
    to indicate what behavior you're looking for. Under the hood, $$DOC{ref:'EasyDAO'}
    will create one or more $$DOC{ref:'DAO'} instances to service your requirements.
    </p>
    <p>Since $$DOC{ref:'EasyDAO'} is a proxy, just use it like you would any other
    $$DOC{ref:'DAO'}, without worrying about the internal $$DOC{ref:'DAO'} doing the
    work.
    </p>
  */},

  properties: [
    {
      name: 'name',
      defaultValueFn: function() { return this.model.plural; },
      documentation: "The developer-friendly name for this $$DOC{ref:'.'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'seqNo',
      defaultValue: false,
      documentation: "Have $$DOC{ref:'.'} use a sequence number to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      model_: 'BooleanProperty',
      name: 'guid',
      label: 'GUID',
      defaultValue: false,
      documentation: "Have $$DOC{ref:'.'} generate guids to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      name: 'seqProperty',
      type: 'Property',
      documentation: "The property on your items to use to store the sequence number or guid. This is required for $$DOC{ref:'.seqNo'} or $$DOC{ref:'.guid'} mode."
    },
    {
      model_: 'BooleanProperty',
      name: 'cache',
      defaultValue: false,
      documentation: "Enable local caching of the $$DOC{ref:'DAO'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'logging',
      defaultValue: false,
      documentation: "Enable logging on the $$DOC{ref:'DAO'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'timing',
      defaultValue: false,
      documentation: "Enable time tracking for concurrent $$DOC{ref:'DAO'} operations."
    },
    {
      name: 'daoType',
      defaultValue: 'IDBDAO',
      documentation: function() { /*
          <p>Selects the basic functionality this $$DOC{ref:'EasyDAO'} should provide.
          You can specify an instance of a DAO model definition such as
          $$DOC{ref:'MDAO'}, or a constant indicating your requirements.</p>
          <p>Choices are:</p>
          <ul>
            <li>$$DOC{ref:'.ALIASES',text:'IDB'}: Use IndexDB for storage.</li>
            <li>$$DOC{ref:'.ALIASES',text:'LOCAL'}: Use local storage (for Chrome Apps, this will use local, non-synced storage).</li>
            <li>$$DOC{ref:'.ALIASES',text:'SYNC'}: Use synchronized storage (for Chrome Apps, this will use Chrome Sync storage).</li>
          </ul>
       */}
    },
    {
      model_: 'BooleanProperty',
      name: 'autoIndex',
      defaultValue: false,
      documentation: "Automatically generate an index."
    },
    {
      model_: 'ArrayProperty',
      name: 'migrationRules',
      subType: 'MigrationRule',
      documentation: "Creates an internal $$DOC{ref:'MigrationDAO'} and applies the given array of $$DOC{ref:'MigrationRule'}."
    }
  ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      IDB:   'IDBDAO',
      LOCAL: 'StorageDAO', // Switches to 'ChromeStorageDAO' for Chrome Apps
      SYNC:  'StorageDAO'  // Switches to 'ChromeSyncStorageDAO' for Chrome Apps
    }
  },

  methods: {
    init: function(args) {
      /*
        <p>On initialization, the $$DOC{ref:'.'} creates an appropriate chain of
        internal $$DOC{ref:'DAO'} instances based on the $$DOC{ref:'.'}
        property settings.</p>
        <p>This process is transparent to the developer, and you can use your
        $$DOC{ref:'.'} like any other $$DOC{ref:'DAO'}.</p>
      */

      this.SUPER(args);

      if ( window.chrome && chrome.storage ) {
        this.ALIASES.LOCAL = 'ChromeStorageDAO';
        this.ALIASES.SYNC  = 'ChromeSyncStorageDAO';
      }

      var daoType  = typeof this.daoType === 'string' ? this.ALIASES[this.daoType] || this.daoType : this.daoType;
      var daoModel = typeof daoType === 'string' ? GLOBAL[daoType] : daoType;
      var params   = { model: this.model, autoIndex: this.autoIndex };

      if ( this.name  ) params.name = this.name;
      if ( this.seqNo || this.guid ) params.property = this.seqProperty;

      var dao = daoModel.create(params);

      if ( MDAO.isInstance(dao) ) {
        this.mdao = dao;
      } else {
        if ( this.migrationRules && this.migrationRules.length ) {
          dao = this.X.MigrationDAO.create({
            delegate: dao,
            rules: this.migrationRules,
            name: this.model.name + "_" + daoModel.name + "_" + this.name
          }, thist.Y);
        }
        if ( this.cache ) {
          this.mdao = MDAO.create(params);
          dao = CachingDAO.create({cache: this.mdao, src: dao, model: this.model});
        }
      }

      if ( this.seqNo && this.guid ) throw "EasyDAO 'seqNo' and 'guid' features are mutually exclusive.";

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = SeqNoDAO.create(args);
      }

      if ( this.guid ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = GUIDDAO.create(args);
      }

      if ( this.timing  ) dao = TimingDAO.create(this.name + 'DAO', dao);
      if ( this.logging ) dao = LoggingDAO.create(dao);

      this.delegate = dao;
    },

    addIndex: function() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addIndex', text:'MDAO.addIndex()'}.</p> */
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    },

    addRawIndex: function() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addRawIndex', text:'MDAO.addRawIndex()'}. */
      this.mdao && this.mdao.addRawIndex.apply(this.mdao, arguments);
      return this;
    }
  }
});


// TODO: Make a Singleton?
CLASS({
  name: 'NullDAO',
  help: 'A DAO that stores nothing and does nothing.',
  methods: {
    put: function(obj, sink) { sink && sink.put && sink.put(obj); },
    remove: function(obj, sink) { sink && sink.remove && sink.remove(obj); },
    select: function(sink) {
      sink && sink.eof && sink.eof();
      return aconstant(sink || [].sink);
    },
    find: function(q, sink) { sink && sink.error && sink.error('find', q); },
    listen: function() {},
    removeAll: function() {},
    unlisten: function() {},
    pipe: function() {},
    where: function() { return this; },
    limit: function() { return this; },
    skip: function() { return this; }
  }
});



CLASS({
  name: 'BusyStatusDAO',
  extendsModel: 'ProxyDAO',
  imports: [
    'busyStatus'
  ],

  methods: {
    wrapSink: function(op, sink) {
      var comp = this.busyStatus.start();
      // NB: We must make sure that whenever anything is called on sink, this
      // is the original sink, not mysink. Otherwise eg. MDAO will fail, as it
      // writes things to mysink.instance_ and not sink.instance_.
      var mysink = {
        error: function() {
          comp();
          sink && sink.error && sink.error.apply(sink, arguments);
        },
        eof: op === 'select' || op === 'removeAll' ?
          function() { comp(); sink && sink.eof && sink.eof(); } :
          sink && sink.eof && sink.eof.bind(sink),
        put: op === 'put' || op === 'find' ?
          function(x) { comp(); sink && sink.put && sink.put(x); } :
          sink && sink.put && sink.put.bind(sink),
        remove: op === 'remove' ?
          function(x) { comp(); sink && sink.remove && sink.remove(x); } :
          sink && sink.remove && sink.remove.bind(sink)
      };

      return mysink;
    },
    select: function(sink, options) {
      return this.delegate.select(this.wrapSink('select', sink || [].sink), options);
    },
    put: function(obj, sink) {
      this.delegate.put(obj, this.wrapSink('put', sink));
    },
    remove: function(obj, sink) {
      this.delegate.remove(obj, this.wrapSink('remove', sink));
    },
    find: function(obj, sink) {
      this.delegate.find(obj, this.wrapSink('find', sink));
    },
    removeAll: function(sink, options) {
      return this.delegate.removeAll(this.wrapSink('removeAll', sink), options);
    }
  }
});

CLASS({
  name: 'ContextualizingDAO',
  extendsModel: 'ProxyDAO',
  methods: {
    find: function(id, sink) {
      var X = this.Y;
      this.delegate.find(id, {
        put: function(o) {
          o.X = X;
          sink && sink.put && sink.put(o);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    }
  }
});

/* Usage:
 * var dao = IDBDAO.create({model: Issue});
 * var dao = IDBDAO.create({model: Issue, name: 'ImportantIssues'});
 *
 * TODO:
 * Optimization.  This DAO doesn't use any indexes in indexeddb yet, which
 * means for any query other than a single find/remove we iterate the entire
 * data store.  Obviously this will get slow if you store large amounts
 * of data in the database.
 */
CLASS({
  name: 'IDBDAO',
  label: 'IndexedDB DAO',

  extendsModel: 'AbstractDAO',

  properties: [
    {
      name:  'model',
      type:  'Model',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'useSimpleSerialization',
      defaultValue: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'indicies'
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      if ( this.useSimpleSerialization ) {
        this.serialize = this.SimpleSerialize;
        this.deserialize = this.SimpleDeserialize;
      } else {
        this.serialize = this.FOAMSerialize;
        this.deserialize = this.FOAMDeserialize;
      }

      this.withDB = amemo(this.openDB.bind(this));
    },

    FOAMDeserialize: function(json) {
      return JSONToObject.visitObject(json);
    },

    FOAMSerialize: function(obj) {
      return ObjectToJSON.visitObject(obj);
    },

    SimpleDeserialize: function(json) {
      return this.model.create(json);
    },

    SimpleSerialize: function(obj) {
      var s = {};
      for ( var key in obj.instance_ ) {
        var prop = obj.model_.getProperty(key);
        if ( ! prop.transient ) s[key] = obj.instance_[key];
      }
      return s;
    },

    openDB: function(cc) {
      var indexedDB = window.indexedDB ||
        window.webkitIndexedDB         ||
        window.mozIndexedDB;

      var request = indexedDB.open("FOAM:" + this.name, 1);

      request.onupgradeneeded = (function(e) {
        var store = e.target.result.createObjectStore(this.name);
        for ( var i = 0; i < this.indicies.length; i++ ) {
          store.createIndex(this.indicies[i][0], this.indicies[i][0], { unique: this.indicies[i][1] });
        }
      }).bind(this);

      request.onsuccess = (function(e) {
        cc(e.target.result);
      }).bind(this);

      request.onerror = function (e) {
        console.log('************** failure', e);
      };
    },

    withStore: function(mode, fn) {
      if ( mode !== 'readwrite' ) return this.withStore_(mode, fn);

      var self = this;

      if ( ! this.q_ ) {
        var q = [fn];
        this.q_ = q;
        EventService.async(function() {
          self.withStore_(mode, function(store) {
            // console.log('q length: ', q.length);
            if ( self.q_ == q ) self.q_ = undefined;
            for ( var i = 0 ; i < q.length ; i++ ) q[i](store);
          });
        }, this.X)();
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    withStore_: function(mode, fn) {
      if ( GLOBAL.__TXN__ && GLOBAL.__TXN__.store ) {
        try {
          fn.call(this, __TXN__.store);
          return;
        } catch (x) {
          GLOBAL.__TXN__ = undefined;
        }
      }
      this.withDB((function (db) {
        var tx = db.transaction([this.name], mode);
        var os = tx.objectStore(this.name);
        if ( GLOBAL.__TXN__ ) GLOBAL.__TXN__.store = os;
        fn.call(this, os);
      }).bind(this));
    },

    put: function(value, sink) {
      var self = this;
      this.withStore("readwrite", function(store) {
        var request = store.put(self.serialize(value),
                                value[self.model.ids[0]]);

        request.transaction.addEventListener(
          'complete',
          function(e) {
            self.notify_('put', [value]);
            sink && sink.put && sink.put(value);
          });
        request.transaction.addEventListener(
          'error',
          function(e) {
            // TODO: Parse a better error mesage out of e
            sink && sink.error && sink.error('put', value);
          });
      });
    },

    find: function(key, sink) {
      if ( Expr.isInstance(key) ) {
        var found = false;
        this.limit(1).where(key).select({
          put: function() {
            found = true;
            sink.put.apply(sink, arguments);
          },
          eof: function() {
            found || sink.error('find', key);
          }
        });
        return;
      }

      var self = this;
      this.withStore("readonly", function(store) {
        var request = store.get(key);
        request.transaction.addEventListener(
          'complete',
          function() {
            if (!request.result) {
              sink && sink.error && sink.error('find', key);
              return;
            }
            var result = self.deserialize(request.result);
            sink && sink.put && sink.put(result);
          });
        request.onerror = function(e) {
          // TODO: Parse a better error out of e
          sink && sink.error && sink.error('find', key);
        };
      });
    },

    remove: function(obj, sink) {
      var self = this;
      var key = obj[this.model.ids[0]] != undefined ? obj[this.model.ids[0]] : obj;

      this.withStore("readwrite", function(store) {
        var getRequest = store.get(key);
        getRequest.onsuccess = function(e) {
          if (!getRequest.result) {
            sink && sink.error && sink.error('remove', obj);
            return;
          }
          var data = self.deserialize(getRequest.result);
          var delRequest = store.delete(key);
          delRequest.transaction.addEventListener('complete', function(e) {
            self.notify_('remove', [data]);
            sink && sink.remove && sink.remove(data);
          });

          delRequest.onerror = function(e) {
            sink && sink.error && sink.error('remove', e);
          };
        };
        getRequest.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        };
        return;
      });
    },

    removeAll: function(sink, options) {
      var query = (options && options.query && options.query.partialEval()) ||
        { f: function() { return true; } };

      var future = afuture();
      var self = this;
      this.withStore('readwrite', function(store) {
        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            var value = self.deserialize(cursor.value);
            if (query.f(value)) {
              var deleteReq = cursor.delete();
              deleteReq.transaction.addEventListener(
                'complete',
                function() {
                  self.notify_('remove', [value]);
                  sink && sink.remove && sink.remove(value);
                });
              deleteReq.onerror = function(e) {
                sink && sink.error && sink.error('remove', e);
              };
            }
            cursor.continue();
          }
        };
        request.transaction.oncomplete = function() {
          sink && sink.eof && sink.eof();
          future.set(sink);
        };
        request.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        };
      });
      return future.get;
    },

    select: function(sink, options) {
      sink = sink || [].sink;
      sink = this.decorateSink_(sink, options, false);

      var fc = this.createFlowControl_();
      var future = afuture();
      var self = this;

      this.withStore("readonly", function(store) {
        if ( options && options.query && EqExpr.isInstance(options.query) && store.indexNames.contains(options.query.arg1.name) ) {
          var request = store.index(options.query.arg1.name).openCursor(IDBKeyRange.only(options.query.arg2.f()));
        } else {
          var request = store.openCursor();
        }
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if ( fc.stopped ) return;
          if ( fc.errorEvt ) {
            sink.error && sink.error(fc.errorEvt);
            future.set(sink, fc.errorEvt);
            return;
          }

          if (!cursor) {
            sink.eof && sink.eof();
            future.set(sink);
            return;
          }

          var value = self.deserialize(cursor.value);
          sink.put(value);
          cursor.continue();
        };
        request.onerror = function(e) {
          sink.error && sink.error(e);
        };
      });

      return future.get;
    },

    addIndex: function(prop) {
      this.indicies.push([prop.name, false]);
      return this;
    }
  },

  listeners: [
    {
      name: 'updated',
      code: function(evt) {
        console.log('updated: ', evt);
        this.publish('updated');
      }
    }
  ]

});



CLASS({
  name: 'LazyCacheDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'cache',
      postSet: function(old, nu) {
        if (old) this.unlisten(old);
        if (nu) this.listen(nu);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'refreshOnCacheHit',
      defaultValue: false,
      documentation: 'When true, makes a network call in the background to ' +
          'update the record, even on a cache hit.'
    },
    {
      model_: 'BooleanProperty',
      name: 'cacheOnSelect',
      documentation: 'Whether to populate the cache on select().',
      defaultValue: false
    },
    {
      model_: 'IntProperty',
      name: 'staleTimeout',
      defaultValue: 500,
      units: 'ms',
      documentation: 'Time in milliseconds before we consider the delegate ' +
          'results to be stale for a particular query and will issue a new ' +
          'select.'
    },
    {
      name: 'selects',
      factory: function() { return {}; }
    },
    {
      name: 'selectKey',
      defaultValue: function(sink, options) {
        var query = ( options && options.query && options.query.toSQL() ) || "";
        var limit = ( options && options.limit );
        var skip =  ( options && options.skip );
        var order = ( options && options.order && options.order.toSQL() ) || "";
        return [query, limit, skip, order];
      }
    }
  ],

  methods: {
    find: function(id, sink) {
      var self = this;

      var mysink = {
        put: this.refreshOnCacheHit ?
            function() {
              self.cache.put.apply(self.cache, arguments);
              sink.put.apply(sink, arguments);
            } :
            sink.put.bind(sink),
        error: function() {
          self.delegate.find(id, {
            put: function(obj) {
              var args = arguments;
              self.cache.put(obj, {
                put: function() { sink.put.apply(sink, args); }
              });
            },
            error: function() {
              sink && sink.error && sink.error.apply(sink, arguments);
            }
          });
        }
      };

      this.cache.find(id, mysink);
    },
    select: function(sink, options) {
      if ( ! this.cacheOnSelect ) {
        return this.SUPER(sink, options);
      }

      sink = sink || [].sink;

      var key = this.selectKey(sink, options);
      var future = afuture();
      var self = this;

      var entry = this.selects[key];

      if ( ! entry ||
           Date.now() - this.selects[key][1] > this.staleTimeout ) {
        this.selects[key] = entry = [afuture(), Date.now()];
        this.delegate.select(this.cache, options)(entry[0].set);
      }

      function readFromCache() {
        self.cache.select(sink, options)(future.set);
      }

      self.cache.select(COUNT(), options)(function(c) {
        if ( c.count > 0 ) {
          readFromCache();
        } else {
          entry[0].get(readFromCache);
        }
      });

      return future.get;
    }
  }
});

CLASS({
  name: 'DAOVersion',
  ids: ['name'],
  properties: [
    'name',
    'version'
  ]
});

CLASS({
  name: 'MigrationRule',
  ids: ['modelName'],
  properties: [
    {
      model_: 'StringProperty',
      name: 'modelName',
    },
    {
      model_: 'IntProperty',
      name: 'version'
    },
    {
      model_: 'FunctionProperty',
      name: 'migration'
    }
  ]
});


CLASS({
  name: 'MigrationDAO',
  extendsModel: 'ProxyDAO',

  imports: [
    'daoVersionDao'
  ],

  properties: [
    {
      name: 'delegate'
    },
    {
      model_: 'ArrayProperty',
      subType: 'MigrationRule',
      name: 'rules'
    },
    {
      name: 'name'
    }
  ],

  methods: {
    init: function() {
      var dao = this.delegate;
      var future = afuture()
      this.delegate = FutureDAO.create({future: future.get});

      var self = this;
      var version;
      aseq(
        function(ret) {
          self.daoVersionDao.find(self.name, {
            put: function(c) {
              version = c;
              ret();
            },
            error: function() {
              version = DAOVersion.create({
                name: self.name,
                version: 0
              });
              ret();
            }
          });
        },
        function(ret) {
          function updateVersion(ret, v) {
            var c = version.clone();
            c.version = v;
            self.daoVersionDao.put(c, ret);
          }

          var rulesDAO = self.rules.dao;

          rulesDAO
            .where(AND(GT(MigrationRule.VERSION, version.version),
                       LTE(MigrationRule.VERSION, self.X.App.version)))
            .select()(function(rules) {
              var seq = [];
              for ( var i = 0; i < rules.length; i++ ) {
                     (function(rule) {
                       seq.push(
                         aseq(
                           function(ret) {
                             rule.migration(ret, dao);
                           },
                           function(ret) {
                             updateVersion(ret, rule.version);
                           }));
                     })(self.rules[i]);
              }
              if ( seq.length > 0 ) aseq.apply(null, seq)(ret);
              else ret();
            });
        })(function() {
          future.set(dao);
        });
      this.SUPER();
    }
  }
});






CLASS({
  name: 'RestDAO',
  extendsModel: 'AbstractDAO',

  imports: [
    'ajsonp'
  ],

  properties: [
    {
      name: 'model',
      label: 'Type of data stored in this DAO.'
    },
    {
      name: 'url',
      label: 'REST API URL.'
    },
    {
      model_: 'ArrayProperty',
      subType: 'Property',
      name: 'paramProperties',
      help: 'Properties that are handled as separate parameters rather than in the query.'
    },
    {
      model_: 'IntProperty',
      name: 'batchSize',
      defaultValue: 200
    },
    {
      model_: 'IntProperty',
      name: 'skipThreshold',
      defaultValue: 1000
    }
  ],

  methods: {
    jsonToObj: function(json) {
      return this.model.create(json);
    },
    objToJson: function(obj) {
      return JSONUtil.compact.stringify(obj);
    },
    buildURL: function(query) {
      return this.url;
    },
    buildFindURL: function(key) {
      return this.url + '/' + key;
    },
    buildPutURL: function(obj) {
      return this.url;
    },
    buildPutParams: function(obj) {
      return [];
    },
    buildSelectParams: function(sink, query) {
      return [];
    },
    put: function(value, sink) {
      var self = this;
      var extra = {};
      this.ajsonp(this.buildPutURL(value),
             this.buildPutParams(value),
             "POST",
             this.objToJson(value, extra)
            )(
        function(resp, status) {
          if ( status !== 200 ) {
            sink && sink.error && sink.error([resp, status]);
            return;
          }
          var obj = self.jsonToObj(resp, extra);
          sink && sink.put && sink.put(obj);
          self.notify_('put', [obj]);
        });
    },
    remove: function(query, sink) {
    },
    select: function(sink, options) {
      sink = sink || [].sink;
      var fut = afuture();
      var self = this;
      var limit;
      var skipped = 0;
      var index = 0;
      var fc = this.createFlowControl_();
      // TODO: This is a very ugly way of passing additional data
      // from buildURL to jsonToObj, used by the IssueCommentNetworkDAO
      // Clean this up.
      var extra = {};
      var params = [];

      if ( options ) {
        index += options.skip || 0;

        var query = options.query;
        var url;

        if ( query ) {
          var origQuery = query;
          query = query.normalize();

          var outquery = [query, origQuery.deepClone()];

          params = this.buildSelectParams(sink, outquery);

          url = this.buildURL(outquery, extra);

          query = outquery[0];
          origQuery = outquery[1];

          var mql = query.toMQL();
          if ( mql ) params.push('q=' + encodeURIComponent(query.toMQL()));
        } else {
          url = this.buildURL();
        }

        if ( options.order ) {
          var sort = options.order.toMQL();
          params.push("sort=" + sort);
        }

        if ( options.limit ) {
          limit = options.limit;
        }
      }

      var finished = false;
      awhile(
        function() { return !finished; },
        function(ret) {
          var batch = self.batchSize;

          if ( Number.isFinite(limit) )
            var batch = Math.min(batch, limit);

          // No need to fetch items for count.
          if ( CountExpr.isInstance(sink) ) {
            batch = 0;
          }

          var myparams = params.slice();
          myparams.push('maxResults=' + batch);
          myparams.push('startIndex=' + index);

          self.ajsonp(url, myparams)(function(data) {
            // Short-circuit count.
            // TODO: This count is wrong for queries that use
            if ( CountExpr.isInstance(sink) ) {
              sink.count = data.totalResults;
              finished = true;
              ret(); return;
            }

            var items = data && data.items ? data.items : [];

            // Fetching no items indicates EOF.
            if ( items.length == 0 ) finished = true;
            index += items.length;

            for ( var i = 0 ; i < items.length; i++ ) {
              var item = self.jsonToObj(items[i], extra)

              // Filter items that don't match due to
              // low resolution of Date parameters in MQL
              if ( origQuery && !origQuery.f(item) ) {
                skipped++;
                continue;
              }

              if ( Number.isFinite(limit) ) {
                if ( limit <= 0 ) { finished = true; break; }
                limit--;
              }

              if ( fc.stopped ) { finished = true; break; }
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                finished = true;
                break;
              }

              sink && sink.put && sink.put(item, null, fc);
            }
            if ( limit <= 0 ) finished = true;
            if ( ! data || index >= data.totalResults ) finished = true;
            if ( skipped >= self.skipThreshold ) finished = true;
            ret();
          });
        })(function() { sink && sink.eof && sink.eof(); fut.set(sink); });

      return fut.get;
    },
    buildFindParams: function(key) {
      return [];
    },
    find: function(key, sink) {
      var self = this;
      this.ajsonp(this.buildFindURL(key), this.buildFindParams())(function(data, status) {
        var deserialized;
        if ( status !== 200 || ! (deserialized = self.jsonToObj(data)) ) {
          sink && sink.error && sink.error('Network error');
          return;
        }

        sink && sink.put && sink.put(deserialized);
      });
    }
  }
});



CLASS({
  name: 'StorageDAO',

  extendsModel: 'MDAO',

  properties: [
    {
      name:  'name',
      label: 'Store Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var objs = localStorage.getItem(this.name);
      if ( objs ) JSONUtil.parse(this.Y, objs).select(this);

      this.addRawIndex({
        execute: function() {},
        bulkLoad: function() {},
        toString: function() { return "StorageDAO Update"; },
        plan: function() {
          return { cost: Number.MAX_VALUE };
        },
        put: this.updated,
        remove: this.updated
      });
    }
  },

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        this.select()(function(a) {
          localStorage.setItem(this.name, JSONUtil.compact.where(NOT_TRANSIENT).stringify(a));
        }.bind(this));
      }
    }
  ]
});

