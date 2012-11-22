/*
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

// Define extensions to built-in prototypes as non-enumerable properties so
// that they don't mess up with Array or Object iteration code.
// (Which needs to be fixed anyway.)


/**
 * Take an array where even values are weights and odd values are functions,
 * and execute one of the functions with propability equal to it's relative
 * weight.
 */
// TODO: move this method somewhere better
function randomAct() {
  var totalWeight = 0.0;
  for ( var i = 0 ; i < arguments.length ; i += 2 ) totalWeight += arguments[i];

  var r = Math.random();

  for ( var i = 0, weight = 0 ; i < arguments.length ; i += 2 ) {
    weight += arguments[i];
    if ( r <= weight / totalWeight ) {
      arguments[i+1]();
      return;
    }
  }
}


function defineProperties(proto, fns) {
  for ( var key in fns ) {
    Object.defineProperty(proto, key, {
      value: fns[key],
      configurable: true,
      writable: true
    });
  }
}


/**
 * Push an array of values onto an array.
 * @param arr array of values
 * @return new length of this array
 */
// TODO: not needed, port and replace with pipe()
Object.defineProperty(Array.prototype, 'pushAll', {
  value: function(arr) {
    this.push.apply(this, arr);
    return this.length;
}});


/**
 * Search for a single element in an array.
 * @param predicate used to determine element to find
 * @param action to be called with (key, index) arguments
 *        when found
 */
Object.defineProperty(Array.prototype, 'find', {
  value: function(predicate, action) {
  for (var i=0; i<this.length; i++)
    if (predicate(this[i], i)) {
      return action(this[i], i) || this[i];
    }
  return undefined;
}});

/** Remove an element from an array. **/
/*
Object.defineProperty(Array.prototype, 'remove', {
  value: function(obj) {
    var i = this.indexOf(obj);

    if ( i != -1 ) this.splice(i, 1);

    return this;
}});
*/

/**
 * ForEach operator on Objects.
 * Calls function with arguments (obj, key).
 **/
Object.defineProperty(Object.prototype, 'forEach', {
  value: function(fn) {
    for ( var key in this ) if (this.hasOwnProperty(key)) fn(this[key], key);
}});


Object.defineProperty(Object.prototype, 'put', {
  value: function(obj) {
    this[obj.id] = obj;
  },
  configurable: true,
  writable: true
});

function filteredDAO(query, dao) {
  return {
    __proto__: dao,
    pipe: function(sink, options) {
      if ( options ) {
        if ( options.query ) {
          options = { __proto__: options, query: AND(query, options.query) };
        } else {
          options = { __proto__: options, query: query };
        }
      }
      else {
        options = {query: query};
      }
      dao.pipe(sink, options);
    }
  };
}

function limitedDAO(count, start, dao) {
  return {
    __proto__: dao,
    pipe: function(sink, options) {
      if ( options ) {
        if ( options.limit ) {
          options = {
            __proto__: options,
            limit: {
              count: Math.min(count, options.limit.count),
              start: start
            }
          };
        } else {
          options = { __proto__: options, limit: {count: count, start: start} };
        }
      }
      else {
        options = {limit: {count: count, start: start}};
      }
      dao.pipe(sink, options);
    }
  };
}

function predicatedSink(predicate, sink) {
  return {
    __proto__: sink,
    put: function(obj, s, fc) {
      if ( predicate.f(obj) ) sink.put(obj, s, fc);
    }
  };
}

function limitedSink(limit, sink) {
  return {
    __proto__: sink,
    i: 0,
    put: function(obj, s, fc) {
      this.i++;
      if ( this.i <= limit.start ) return;
      sink.put(obj, s, fc);
      if ( this.i >= limit.start + limit.count && fc ) fc.stop();
    }
  };
}


defineProperties(Array.prototype, {
  clone: function() { return new Array(this); },
  put: function(obj, sink) {
    var added = false;
    for (var idx in this) {
      if (this[idx].id === obj.id) {
	this[idx] = obj;
        sink && sink.error && sink.error('duplicate');
        return;
      }
    }
    this.push(obj);
    sink && sink.put && sink.put(obj);
    this.notify('put', arguments);
  },
  remove: function(query, callback) {
    var param = query;
    if (! EXPR.isInstance(query))
      query = function(obj) { return obj.id === param; };

    // TODO: call callback (sink)
    for (var i = 0; i < this.length; i++) {
      var obj = this[i];
      if (query.f(obj)) {
        this.splice(i,1);
        i--;
      }
    }
    this.notify('remove', arguments);
  },
  pipe: function(sink, options) {
    this.pipe_(
      this.decorateSink_(sink, options, false),
      options,
      this.createFlowControl_());

    sink.eof && sink.eof();
  },
  listen: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    if ( ! this.listeners_ ) this.listeners_ = [];
    this.listeners_.push(sink);
  },
  pipeAndListen: function(sink, options) {
    sink = this.decorateSink_(sink, options, true);
    var fc = this.createFlowControl_();

    this.pipe_(sink, options, fc);

    if ( ! fc.stopped ) this.listen(sink, options);
  },
  decorateSink_: function(sink, options, isListener) {
    if ( options ) {
      if ( options.query )
        sink = predicatedSink(options.query.partialEval(), sink);
      if ( options.limit )
        sink = limitedSink(options.limit, sink);
      if ( options.orderBy && ! isListener )
        sink = orderedSink(options.orderBy, sink);
    }

    return sink;
  },
  createFlowControl_: function() {
    return {
      stop: function() { this.stopped = true; },
      error: function(e) { this.errorEvt = e; }
    };
  },
  pipe_: function(sink, options, fc) {
    for (var i in this) {
      sink.put(this[i], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt && sink.error ) {
        sink.error(fc.errorEvt);
        break;
      }
    }
  },
  where: function(query) {
    return filteredDAO(query, this);
  },
  limit: function(count, opt_start) {
    return limitedDAO(count, opt_start || 0, this);
  },
  unlisten: function(sink) {
    this.listeners_ && this.listeners_.remove(sink);
  },
  notify: function(fName, args) {
    if ( ! this.listeners_ ) return;

    for ( var i = 0 ; i < this.listeners_.length ; i++ ) {
      var l = this.listeners_[i];
      var fn = l[fName];
      args[2] = {
        stop: (function(fn, l) { return function() { fn(l); }})(this.unlisten.bind(this), l),
        error: function(e) { /* Don't care. */ }
      };
      fn && fn.apply(l, args);
    }
  }
});



console.log.json = function() {
   var args = [];
   for ( var i = 0 ; i < arguments.length ; i++ ) {
     var arg = arguments[i];
     args.push(arg && arg.toJSON ? arg.toJSON() : arg);
   }
   console.log.apply(console, args);
};

console.log.str = function() {
   var args = [];
   for ( var i = 0 ; i < arguments.length ; i++ ) {
     var arg = arguments[i];
     args.push(arg && arg.toString ? arg.toString() : arg);
   }
   console.log.apply(console, args);
};

// Promote 'console.log' into a Sink
console.log.put         = console.log.bind(console);
console.log.remove      = console.log.bind(console, 'remove: ');
console.log.json.put    = console.log.json.bind(console);
console.log.json.remove = console.log.json.bind(console, 'remove: ');
console.log.str.put     = console.log.str.bind(console);
console.log.str.remove  = console.log.str.bind(console, 'remove: ');

/*
EQ(Issue.SEVERITY, 'Major').pipe(console.log);
  add

*/

String.prototype.put = function(obj) { return this + obj.toJSON(); };
