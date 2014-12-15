/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

// ???: Is there any point in making this an Interface, or just a Concrete Model
INTERFACE({
  name: 'FlowControl',
  description: 'DAO FLow Control.  Used to control select() behavior.',

  methods: [
    {
      name: 'stop'
    },
    {
      name: 'error',
      args: [
        { name: 'e', type: 'Object' }
      ]
    },
    {
      name: 'isStopped',
      description: 'Returns true iff this selection has been stopped.',
      returnType: 'Boolean'
    },
    {
      name: 'getError',
      description: 'Returns error passed to error(), or undefined if error() never called',
      returnType: 'Object'
    }
    /*
    // For future use.
    {
    name: 'advance',
    description: 'Advance selection to the specified key.',
    args: [
    { name: 'key', type: 'Object' },
    { name: 'inclusive', type: 'Object', optional: true, defaultValue: true },

    ]
    }*/
  ]
});


INTERFACE({
  name: 'Sink',
  description: 'Data Sink',

  documentation: function() {/*
    <p>The $$DOC{ref:'Sink'} $$DOC{ref:'Interface'} forms the basis for all data
    access. At a minimum, data stores must support the
    $$DOC{ref:'.put'} and $$DOC{ref:'.remove'} operations.</p>
  */},

  methods: [
    {
      name: 'put',
      description: 'Put (add) an object to the Sink.',
      documentation: "<p>Adds the given object to the store.<p>",
      args: [
        { name: 'obj', type: 'Object', documentation: 'The object to add.' },
        { name: 'sink', type: 'Sink', documentation: '<p>The next sink to chain: sink.put(obj) is called after this.put() completes.</p>' }
      ]
    },
    {
      name: 'remove',
      description: 'Remove a single object.',
      documentation: "Removes the given object from the store.",
      args: [
        { name: 'obj', type: 'Object', documentation: 'The object to remove.' },
        { name: 'sink', type: 'Sink', documentation: '<p>The next sink to chain: sink.remove(obj) is called after this.remove() completes.</p>' }
      ]
    },
    {
      name: 'error',
      description: 'Report an error.',
      documentation: "<p>Report an error to the $$DOC{ref:'Sink'}.</p>",
      args: [
        { name: 'obj', type: 'Object' }
      ]
    },
    {
      name: 'eof',
      description: 'Indicate that no more operations will be performed on the Sink.',
      documentation: "<p>Indicates that no more operations will be performed on the $$DOC{ref:'Sink'}.</p>"
    }
  ]
});


INTERFACE({
  name: 'Predicate',
  description: 'A boolean Predicate.',

  methods: [
    {
      name: 'f',
      description: 'Find a single object, using either a Predicate or the primary-key.',
      returnType: 'Boolean',
      args: [
        { name: 'o', description: 'The object to be predicated.' }
      ]
    },
  ]
});


INTERFACE({
  name: 'Comparator',
  description: 'A strategy for comparing pairs of Objects.',

  methods: [
    {
      name: 'compare',
      description: 'Compare two objects, returning 0 if they are equal, > 0 if the first is larger, and < 0 if the second is.',
      returnType: 'Int',
      args: [
        { name: 'o1', description: 'The first object to be compared.' },
        { name: 'o2', description: 'The second object to be compared.' }
      ]
    },
  ]
});


// 'options': Map including 'query', 'order', and 'limit', all optional

INTERFACE({
  name: 'DAO',
  description: 'Data Access Object',
  extends: ['Sink'],

  methods: [
    {
      name: 'find',
      description: 'Find a single object, using either a Predicate or the primary-key.',
      args: [
        { name: 'key', type: 'Predicate|Object' },
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'removeAll',
      description: 'Remove all (scoped) objects.',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'select',
      description: 'Select all (scoped) objects.',
      args: [
        { name: 'sink', type: 'SinkI', optional: true, help: 'Defaults to [].' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'pipe',
      description: 'The equivalent of doing a select() followed by a listen().',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'listen',
      description: 'Listen for future (scoped) updates to the DAO.',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'unlisten',
      description: 'Remove a previously registered listener.',
      args: [
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'where',
      description: 'Return a DAO that will be filtered to the specified predicate.',
      returnValue: 'DAO',
      args: [
        { name: 'query', type: 'Predicate' }
      ]
    },
    {
      name: 'limit',
      description: 'Return a DAO that will limit future select()\'s to the specified number of results.',
      returnValue: 'DAO',
      args: [
        { name: 'count', type: 'Int' }
      ]
    },
    {
      name: 'skip',
      description: 'Return a DAO that will skip the specified number of objects from future select()\'s',
      returnValue: 'DAO',
      args: [
        { name: 'skip', type: 'Int' }
      ]
    },
    {
      name: 'orderBy',
      description: 'Return a DAO that will order future selection()\'s by the specified sort order.',
      returnValue: 'DAO',
      args: [
        {
          name: 'comparators',
          rest: true,
          type: 'Comparator',
          description: 'One or more comparators that specify the sort-order.'
        }
      ]
    }
    // Future: drop() - drop/remove the DAO
    //         cmd()  - handle extension operations
  ]
});


var LoggingDAO = {

  create: function(/*[logger], delegate*/) {
    var logger, delegate;
    if ( arguments.length == 2 ) {
      logger = arguments[0];
      delegate = arguments[1];
    } else {
      logger = console.log.bind(console);
      delegate = arguments[0];
    }

    return {
      __proto__: delegate,

      put: function(obj, sink) {
        logger('put', obj);
        delegate.put(obj, sink);
      },
      remove: function(query, sink) {
        logger('remove', query);
        delegate.remove(query, sink);
      },
      select: function(sink, options) {
        logger('select', options || "");
        return delegate.select(sink, options);
      },
      removeAll: function(sink, options) {
        logger('removeAll', options);
        return delegate.removeAll(sink, options);
      }
    };
  }
};


var TimingDAO = {

  create: function(name, delegate) {
    // Used to distinguish between concurrent operations
    var id;
    var activeOps = {put: 0, remove:0, find: 0, select: 0};
    function start(op) {
      var str = name + '-' + op;
      var key = activeOps[op]++ ? str + '-' + (id++) : str;
      console.time(id);
      return [key, str, window.performance.now(), op];
    }
    function end(act) {
      activeOps[act[3]]--;
      id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (window.performance.now()-act[2]).toFixed(3), ' ms');
    }
    function endSink(act, sink) {
      return {
        put:    function() { end(act); sink && sink.put    && sink.put.apply(sink, arguments); },
        remove: function() { end(act); sink && sink.remove && sink.remove.apply(sink, arguments); },
        error:  function() { end(act); sink && sink.error  && sink.error.apply(sink, arguments); },
        eof:    function() { end(act); sink && sink.eof    && sink.eof.apply(sink, arguments); }
      };
    }
    return {
      __proto__: delegate,

      put: function(obj, sink) {
        var act = start('put');
        delegate.put(obj, endSink(act, sink));
      },
      remove: function(query, sink) {
        var act = start('remove');
        delegate.remove(query, endSink(act, sink));
      },
      find: function(key, sink) {
        var act = start('find');
        delegate.find(key, endSink(act, sink));
      },
      select: function(sink, options) {
        var act = start('select');
        var fut = afuture();
        delegate.select(sink, options)(function(s) {
          end(act);
          fut.set(s);
        });
        return fut.get;
      }
    };
  }
};


var ObjectToJSON = {
  __proto__: Visitor.create(),

  visitFunction: function(o) {
    return o.toString();
  },

  visitObject: function(o) {
    this.push({model_: o.model_.name});
    this.__proto__.visitObject.call(this, o);
    return this.pop();
  },
  visitProperty: function(o, prop) {
    this.top()[prop.name] = this.visit(o[prop.name]);
  },

  visitMap: function(o) {
    this.push({});
    Visitor.visitMap.call(this, o);
    return this.pop();
  },
  visitMapElement: function(key, value) { this.top()[key] = this.visit(value); },

  visitArray: function(o) {
    this.push([]);
    this.__proto__.visitArray.call(this, o);
    return this.pop();
  },
  visitArrayElement: function (arr, i) { this.top().push(this.visit(arr[i])); }
};


var JSONToObject = {
  __proto__: ObjectToJSON.create(),

  visitString: function(o) {
    try {
      return o.substr(0, 8) === 'function' ?
        eval('(' + o + ')') :
        o ;
    } catch (x) {
      console.log(x, o);
      return o;
    }
  },

  visitObject: function(o) {
    var model   = GLOBAL[o.model_];
    if ( ! model ) throw ('Unknown Model: ', o.model_);
    var obj     = model.create();

    //    o.forEach((function(value, key) {
    // Workaround for crbug.com/258522
    Object_forEach(o, (function(value, key) {
      if ( key !== 'model_' ) obj[key] = this.visit(value);
    }).bind(this));

    return obj;
  },

  // Substitute in-place
  visitArray: Visitor.visitArray,
  visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); }
};


CLASS({
  name: 'AbstractDAO',

  documentation: function() {/*
    The base for most DAO implementations, $$DOC{ref:'.'} provides basic facilities for
    $$DOC{ref:'.where'}, $$DOC{ref:'.limit'}, $$DOC{ref:'.skip'}, and $$DOC{ref:'.orderBy'}
    operations, and provides for notifications of updates through $$DOC{ref:'.listen'}.
  */},

  properties: [
    {
      name: 'daoListeners_',
      transient: true,
      hidden: true,
      factory: function() { return []; }
    }
  ],

  methods: {
    update: function(expr) { /* Applies a change to the DAO contents. */
      return this.select(UPDATE(expr, this));
    },

    listen: function(sink, options) { /* Send future changes to sink. */
      sink = this.decorateSink_(sink, options, true);
      this.daoListeners_.push(sink);
    },

    select: function(sink, options) {
      /* Template method. Override to copy the contents of this DAO (filtered or ordered as
      necessary) to sink. */
    },
    remove: function(query, sink) {
      /* Template method. Override to remove matching items and put them into sink if supplied. */
    },

    pipe: function(sink, options) { /* A $$DOC{ref:'.select'} followed by $$DOC{ref:'.listen'}.
           Dump our contents to sink, then send future changes there as well. */
      sink = this.decorateSink_(sink, options, true);

      var fc   = this.createFlowControl_();
      var self = this;

      this.select({
        put: function() {
          sink.put && sink.put.apply(sink, arguments);
        },
        remove: function() {
          sink.remove && sink.remove.apply(sink, arguments);
        },
        error: function() {
          sink.error && sink.error.apply(sink, arguments);
        },
        eof: function() {
          if ( fc.stopped ) {
            sink.eof && sink.eof();
          } else {
            self.listen(sink, options);
          }
        }
      }, options, fc);
    },

    decorateSink_: function(sink, options, isListener, disableLimit) {
      if ( options ) {
        if ( ! disableLimit ) {
          if ( options.limit ) sink = limitedSink(options.limit, sink);
          if ( options.skip )  sink = skipSink(options.skip, sink);
        }

        if ( options.order && ! isListener ) {
          sink = orderedSink(options.order, sink);
        }

        if ( options.query ) {
          sink = predicatedSink(
            options.query.partialEval ?
              options.query.partialEval() :
              options.query,
            sink) ;
        }
      }

      return sink;
    },

    createFlowControl_: function() {
      return {
        stop: function() { this.stopped = true; },
        error: function(e) { this.errorEvt = e; }
      };
    },

    where: function(query) { /* Return a DAO that contains a filtered subset of this one. */
      // only use X if we are an invalid instance without a this.X
      return (this.X || X).FilteredDAO_.create({query: query, delegate: this});
    },

    limit: function(count) { /* Return a DAO that contains a count limited subset of this one. */
      return (this.X || X).LimitedDAO_.create({count:count, delegate:this});
    },

    skip: function(skip) { /* Return a DAO that contains a subset of this one, skipping initial items. */
      return (this.X || X).SkipDAO_.create({skip:skip, delegate:this});
    },

    orderBy: function() { /* Return a DAO that contains a subset of this one, ordered as specified. */
      return (this.X || X).OrderedDAO_.create({ comparator: arguments.length == 1 ? arguments[0] : argsToArray(arguments), delegate: this });
    },

    unlisten: function(sink) { /* Stop sending updates to the given sink. */
      var ls = this.daoListeners_;
//      if ( ! ls.length ) console.warn('Phantom DAO unlisten: ', this, sink);
      for ( var i = 0; i < ls.length ; i++ ) {
        if ( ls[i].$UID === sink.$UID ) {
          ls.splice(i, 1);
          return true;
        }
      }
    },

    // Default removeAll: calls select() with the same options and
    // calls remove() for all returned values.
    removeAll: function(sink, options) { /* Default $$DOC{ref:'.removeAll'}: calls
            $$DOC{ref:'.select'} with the same options and calls $$DOC{ref:'.remove'}
             for all returned values. */
      var self = this;
      var future = afuture();
      this.select({
        put: function(obj) {
          self.remove(obj, { remove: sink && sink.remove });
        }
      })(function() {
        sink && sink.eof();
        future.set();
      });
      return future.get;
    },

    /**
     * Notify all listeners of update to DAO.
     * @param fName the name of the method in the listeners to call.
     *        possible values: 'put', 'remove'
     **/
    notify_: function(fName, args) {
      // console.log(this.name_, ' ***** notify ', fName, ' args: ', args, ' listeners: ', this.daoListeners_);
      for( var i = 0 ; i < this.daoListeners_.length ; i++ ) {
        var l = this.daoListeners_[i];
        var fn = l[fName];
        if ( fn ) {
          // Create flow-control object
          args[2] = {
            stop: (function(fn, l) {
              return function() { fn(l); };
            })(this.unlisten.bind(this), l),
            error: function(e) { /* Don't care. */ }
          };
          try {
            fn.apply(l, args);
          } catch(err) {
            if ( err !== this.UNSUBSCRIBE_EXCEPTION ) {
              console.error('Error delivering event (removing listener): ', fName, err);
            }
            this.unlisten(l);
          }
        }
      }
    }
  }
});


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
          this.notify_('put', []);
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


// deprecated. Use a LimitedDAO_ instance instead.
function limitedDAO(count, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( 'limit' in options ) {
          options = {
            __proto__: options,
            limit: Math.min(count, options.limit)
          };
        } else {
          options = { __proto__: options, limit: count };
        }
      }
      else {
        options = { limit: count };
      }

      return dao.select(sink, options);
    },
    toString: function() {
      return dao + '.limit(' + count + ')';
    }
  };
}


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


var ModelDAO = {
  create: function(namespace, dao) {
    var res = {
      __proto__: dao,
      namespace: namespace,
      dao:       dao,
      created:   { },

      init_: function() {
        var self = this;
        this.pipe({
          put: self.add_.bind(this),
          remove: self.del_.bind(this)
        });
      },

      add_: function(obj) {
        if ( obj.name == 'Model' ) return;

        var dao = this;

        this.namespace[obj.name] = obj;

        FOAM.putFactory(this.namespace, obj.name + "Proto", function() {
          return this.namespace[obj.name].getPrototype();
        });

        FOAM.putFactory(this.namespace, obj.name + 'DAO', function() {
          console.log("Creating '" + obj.name + "DAO'");
          return StorageDAO.create({ model: obj });
        });
      },

      del_: function() {
        for (var objID in this.created) {
          delete this.namespace[objID];
        }
      }

      //TODO: remove models from namespace on remove()
    };
    res.init_();
    return res;
  }
};


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


var WaitCursorDAO = FOAM({
  model_: 'Model',
  name: 'WaitCursorDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'count',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        if ( ! this.window ) return;
        if ( oldValue == 0 ) DOM.setClass(this.window.document.body, 'waiting');
        else if ( newValue == 0 ) DOM.setClass(this.window.document.body, 'waiting', false);
      }
    },
    {
      name: 'window'
    }
  ],

  methods: {
    select: function(sink, options) {
      var self = this;
      var future = afuture();

      this.count++;
      var f = function() {
        self.delegate.select(sink, options)(function(sink) {
          try {
            future.set(sink);
          } finally {
          // ???: Do we need to call this asynchronously if count == 0?
            self.count--;
          }
        });
      };

      // Need to delay when turning on hourglass to give DOM a chance to update
      if ( this.count > 1 ) { f(); } else { this.window.setTimeout(f, 1); };

      return future.get;
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
          });
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



// Experimental, convert all functions into sinks
Function.prototype.put    = function() { this.apply(this, arguments); };
Function.prototype.remove = function() { this.apply(this, arguments); };
//Function.prototype.error  = function() { this.apply(this, arguments); };
//Function.prototype.eof    = function() { this.apply(this, arguments); };
