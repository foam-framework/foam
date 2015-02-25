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
    this.push({
      model_: (o.model_.package ? o.model_.package + '.' : '') + o.model_.name
    });
    this.__proto__.visitObject.call(this, o);
    return this.pop();
  },
  visitProperty: function(o, prop) {
    prop.propertyToJSON(this, this.top(), o);
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
      return o.substr(0, 9) === 'function(' ?
        eval('(' + o + ')') :
        o ;
    } catch (x) {
      console.log(x, o);
      return o;
    }
  },

  visitObject: function(o) {
    var model   = FOAM.lookup(o.model_);
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
      // only use X if we are an invalid instance without a this.Y
      return (this.Y || X).FilteredDAO_.create({query: query, delegate: this});
    },

    limit: function(count) { /* Return a DAO that contains a count limited subset of this one. */
      return (this.Y || X).LimitedDAO_.create({count:count, delegate:this});
    },

    skip: function(skip) { /* Return a DAO that contains a subset of this one, skipping initial items. */
      return (this.Y || X).SkipDAO_.create({skip:skip, delegate:this});
    },

    orderBy: function() { /* Return a DAO that contains a subset of this one, ordered as specified. */
      return (this.Y || X).OrderedDAO_.create({ comparator: arguments.length == 1 ? arguments[0] : argsToArray(arguments), delegate: this });
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


// Experimental, convert all functions into sinks
Function.prototype.put    = function() { this.apply(this, arguments); };
Function.prototype.remove = function() { this.apply(this, arguments); };
Function.prototype.reset = function() { this.call(this); };
//Function.prototype.error  = function() { this.apply(this, arguments); };
//Function.prototype.eof    = function() { this.apply(this, arguments); };
