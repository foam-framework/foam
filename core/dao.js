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

  visitObject: function(o) {
    var model   = X.lookup(o.model_);
    if ( ! model ) throw new Error('Unknown Model: ' + o.model_);
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
  name: 'FilteredDAO_',
  extends: 'foam.dao.ProxyDAO',

  documentation: '<p>Internal use only.</p>',

  properties: [
    {
      name: 'query',
      swiftType: 'ExprProtocol!',
      swiftDefaultValue: 'nil',
      required: true
    }
  ],
  methods: [
    {
      name: 'select',
      code: function(sink, options, opt_X) {
        return this.delegate.select(sink, options ? {
          __proto__: options,
          query: options.query ?
            AND(this.query, options.query) :
            this.query
        } : {query: this.query}, opt_X);
      },
      swiftCode: function() {/*
        if options.query != nil { options.query = AND(query, options.query) }
        else { options.query = query }
        return delegate.select(sink, options: options)
      */},
    },
    function removeAll(sink, options, opt_X) {
      return this.delegate.removeAll(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(this.query, options.query) :
          this.query
      } : {query: this.query}, opt_X);
    },
    function listen(sink, options) {
      return this.SUPER(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(this.query, options.query) :
          this.query
      } : {query: this.query});
    },
    function toString() {
      return this.delegate + '.where(' + this.query + ')';
    }
  ]
});


CLASS({
  name: 'OrderedDAO_',
  extends: 'foam.dao.ProxyDAO',

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
    select: function(sink, options, opt_X) {
      if ( options ) {
        if ( ! options.order )
          options = { __proto__: options, order: this.comparator };
      } else {
        options = {order: this.comparator};
      }

      return this.delegate.select(sink, options, opt_X);
    },
    toString: function() {
      return this.delegate + '.orderBy(' + this.comparator + ')';
    }
  }

});


CLASS({
  name: 'LimitedDAO_',
  extends: 'foam.dao.ProxyDAO',

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
    select: function(sink, options, opt_X) {
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

      return this.delegate.select(sink, options, opt_X);
    },
    toString: function() {
      return this.delegate + '.limit(' + this.count + ')';
    }
  }
});


CLASS({
  name: 'SkipDAO_',
  extends: 'foam.dao.ProxyDAO',

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
    select: function(sink, options, opt_X) {
      options = options ? { __proto__: options, skip: this.skip } : { skip: this.skip };

      return this.delegate.select(sink, options, opt_X);
    },
    toString: function() {
      return this.delegate + '.skip(' + this.skip + ')';
    }
  }
});


CLASS({
  name: 'RelationshipDAO',
  extends: 'FilteredDAO_',
  documentation: 'Adapts a DAO based on a Relationship.',

  properties: [
    {
      name: 'relatedProperty',
      required: true
    },
    {
      name: 'relativeID',
      required: true
    },
    {
      name: 'query',
      lazyFactory: function() {
        return AND(NEQ(this.relatedProperty, ''),
            EQ(this.relatedProperty, this.relativeID));
      }
    },
  ],

  methods: [
    function put(obj, sink) {
      obj[this.relatedProperty.name] = this.relativeID;
      this.SUPER(obj, sink);
    }
  ]
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
      factory: function() { return []; },
      swiftType: 'NSMutableArray',
      swiftFactory: 'return NSMutableArray()',
      compareProperty: function() { return 0; },
    }
  ],

  methods: [
    function update(expr) { /* Applies a change to the DAO contents. */
      return this.select(UPDATE(expr, this));
    },

    {
      name: 'select',
      code: function(sink, options) {
        /* Template method. Override to copy the contents of this DAO (filtered or ordered as
        necessary) to sink. */
      },
      args: [
        {
          name: 'sink',
          swiftType: 'Sink = ArraySink()',
        },
        {
          name: 'options',
          swiftType: 'DAOQueryOptions = DAOQueryOptions()',
        },
      ],
      swiftReturnType: 'Future',
      swiftCode: 'return Future().set(sink)',
    },
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject',
        },
        {
          name: 'sink',
          swiftType: 'Sink = ArraySink()',
        },
      ],
      swiftCode: '// Override',
    },
    {
      name: 'remove',
      code: function(query, sink) {
        /* Template method. Override to remove matching items and put them into sink if supplied. */
      },
      args: [
        {
          name: 'obj',
          swiftType: 'FObject',
        },
        {
          name: 'sink',
          swiftType: 'Sink = ArraySink()',
        },
      ],
      swiftCode: '// Override',
    },
    {
      name: 'find',
      code: function(id, sink) {
        /* Template method. Override to return an object from the dao with the given id. */
      },
      args: [
        {
          name: 'id',
          swiftType: 'String',
        },
        {
          name: 'sink',
          swiftType: 'Sink',
        },
      ],
      swiftCode: '// Override',
    },

    function pipe(sink, options) { /* A $$DOC{ref:'.select'} followed by $$DOC{ref:'.listen'}.
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

    {
      name: 'decorateSink_',
      code: function (sink, options, isListener, disableLimit) {
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
      args: [
        {
          name: 'sink',
          swiftIsMutable: true,
          swiftType: 'Sink',
        },
        {
          name: 'options',
          swiftType: 'DAOQueryOptions',
        },
      ],
      swiftReturnType: 'Sink',
      swiftCode: function() {/*
        if options.query != nil {
          sink = PredicatedSink(args: [
            "delegate": sink,
            "expr": options.query!
          ])
        }
        return sink
      */},
    },

    function createFlowControl_() {
      return {
        stop: function() { this.stopped = true; },
        error: function(e) { this.errorEvt = e; }
      };
    },

    {
      name: 'where',
      code: function(query) { /* Return a DAO that contains a filtered subset of this one. */
        // only use X if we are an invalid instance without a this.Y
        return (this.Y || X).lookup('FilteredDAO_').create({query: query, delegate: this});
      },
      args: [
        {
          name: 'query',
          swiftType: 'ExprProtocol',
        },
      ],
      swiftReturnType: 'AbstractDAO',
      swiftCode: function() {/*
        let filteredDAO = FilteredDAO_()
        filteredDAO.delegate = self
        filteredDAO.query = query
        return filteredDAO
      */}
    },

    function limit(count) { /* Return a DAO that contains a count limited subset of this one. */
      return (this.Y || X).lookup('LimitedDAO_').create({count:count, delegate:this});
    },

    function skip(skip) { /* Return a DAO that contains a subset of this one, skipping initial items. */
      return (this.Y || X).lookup('SkipDAO_').create({skip:skip, delegate:this});
    },

    function orderBy() { /* Return a DAO that contains a subset of this one, ordered as specified. */
      return (this.Y || X).lookup('OrderedDAO_').create({ comparator: arguments.length == 1 ? arguments[0] : argsToArray(arguments), delegate: this });
    },

    {
      name: 'listen',
      code: function(sink, options) { /* Send future changes to sink. */
        this.daoListeners_.push(this.decorateSink_(sink, options, true));
      },
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
        },
        {
          name: 'options',
          swiftType: 'DAOQueryOptions = DAOQueryOptions()',
        }
      ],
      swiftCode: 'self.daoListeners_.addObject(self.decorateSink_(sink, options: options))'
    },

    {
      name: 'unlisten',
      code: function unlisten(sink) { /* Stop sending updates to the given sink. */
        var ls = this.daoListeners_;
  //      if ( ! ls.length ) console.warn('Phantom DAO unlisten: ', this, sink);
        for ( var i = 0; i < ls.length ; i++ ) {
          if ( ls[i].$UID === sink.$UID ) {
            ls.splice(i, 1);
            return true;
          }
        }
        if ( DEBUG ) console.warn('Phantom DAO unlisten: ', this, sink);
      },
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
        },
      ],
      swiftReturnType: 'Bool',
      swiftCode: function() {/*
        let index = daoListeners_.indexOfObject(sink)
        if index == NSNotFound {
          return false
        }
        daoListeners_.removeObjectAtIndex(index)
        return true
      */},
    },

    {
      name: 'removeAll',
      // Default removeAll: calls select() with the same options and
      // calls remove() for all returned values.
      code: function(sink, options) { /* Default $$DOC{ref:'.removeAll'}: calls
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
      args: [
        {
          name: 'sink',
          swiftType: 'Sink = ArraySink()',
        },
        {
          name: 'options',
          swiftType: 'DAOQueryOptions = DAOQueryOptions()',
        },
      ],
      swiftReturnType: 'Future',
      swiftCode: function() {/*
        let future = Future()
        let removeSink = ClosureSink(args: [
          "putFn": FoamFunction(fn: { (args) -> AnyObject? in
            let obj = args[0] as! FObject
            self.remove(obj, sink: ClosureSink(args: [
              "removeFn": FoamFunction(fn: { (args) -> AnyObject? in
                let obj = args[0] as! FObject
                sink.remove(obj)
                return nil
              }),
            ]));
            return nil
          }),
        ])
        self.select(removeSink, options: options).get { _ in
          sink.eof()
          future.set(sink)
        }
        return future;
      */},
    },

    {
      /**
       * Notify all listeners of update to DAO.
       * @param fName the name of the method in the listeners to call.
       *        possible values: 'put', 'remove'
       **/
      name: 'notify_',
      code: function(fName, args) {
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
                if ( DEBUG ) console.error(err.stack); // TODO: make a NO_DEBUGGER flag for mobile debugger mode?
              }
              this.unlisten(l);
            }
          }
        }
      },
      args: [
        {
          name: 'fName',
          swiftType: 'String',
        },
        {
          name: 'fObj',
          swiftType: 'FObject? = nil',
        },
      ],
      swiftCode: function() { /*
        switch fName {
          case "put":
            for l in self.daoListeners_ {
              let l = l as! Sink
              l.put(fObj!)
            }
            break
          case "remove":
            for l in self.daoListeners_ {
              let l = l as! Sink
              l.remove(fObj!)
            }
            break
          case "reset":
            for l in self.daoListeners_ {
              let l = l as! Sink
              l.reset()
            }
            break
          default:
            fatalError("DAO notify with unexpected function \(fName)")
        }
      */},
    },

  ]
});


// Experimental, convert all functions into sinks
Function.prototype.put    = function() { this.apply(this, arguments); };
Function.prototype.remove = function() { this.apply(this, arguments); };
Function.prototype.reset = function() { this.call(this); };
//Function.prototype.error  = function() { this.apply(this, arguments); };
//Function.prototype.eof    = function() { this.apply(this, arguments); };
