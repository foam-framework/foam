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

// todo: add enabled/disabled support
// todo: bind
// todo: generateTopic()
// todo: cleanup empty topics after subscriptions removed

/** Publish and Subscribe Event Notification Service. **/
// ??? Whould 'Observable' be a better name?
// TODO(kgr): Model or just make part of FObject?

var __ROOT__ = {};

MODEL({
  name: 'EventService',

  extendsModel: '__ROOT__',

  constants: {
    /** If listener thows this exception, it will be removed. **/
    UNSUBSCRIBE_EXCEPTION: 'unsubscribe',

    /** Used as topic suffix to specify broadcast to all sub-topics. **/
    WILDCARD: '*'
  },

  methods: {
    /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
    oneTime: function(listener) {
      return function() {
        listener.apply(this, argsToArray(arguments));

        throw EventService.UNSUBSCRIBE_EXCEPTION;
      };
    },

    /** Log all listener invocations to console. **/
    consoleLog: function(listener) {
      return function() {
        var args = argsToArray(arguments);
        console.log(args);

        listener.apply(this, args);
      };
    },

    /**
     * Merge all notifications occuring in the specified time window into a single notification.
     * Only the last notification is delivered.
     *
     * @param opt_delay time in milliseconds of time-window, defaults to 16ms, which is
     *        the smallest delay that humans aren't able to perceive.
     **/
    merged: function(listener, opt_delay, opt_X) {
      var setTimeoutX = ( opt_X && opt_X.setTimeout ) || setTimeout;
      var delay = opt_delay || 16;

      return function() {
        var triggered    = false;
        var unsubscribed = false;
        var lastArgs     = null;

        var f = function() {
          lastArgs = arguments;

          if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

          if ( ! triggered ) {
            triggered = true;
            try {
              setTimeoutX(
                function() {
                  triggered = false;
                  var args = argsToArray(lastArgs);
                  lastArgs = null;
                  try {
                    listener.apply(this, args);
                  } catch (x) {
                    if ( x === EventService.UNSUBSCRIBE_EXCEPTION ) unsubscribed = true;
                  }
                }, delay);
            } catch(e) {
              // TODO: Clean this up when we move EventService into the context.
              throw EventService.UNSUBSCRIBE_EXCEPTION;
            }
          }
        };

        if ( DEBUG ) f.toString = function() {
          return 'MERGED(' + delay + ', ' + listener.$UID + ', ' + listener + ')';
        };

        return f;
      }();
    },

    /**
     * Merge all notifications occuring until the next animation frame.
     * Only the last notification is delivered.
     **/
    // TODO: execute immediately from within a requestAnimationFrame
    framed: function(listener, opt_X) {
      opt_X = opt_X || this.X;
      var requestAnimationFrameX = ( opt_X && opt_X.requestAnimationFrame ) || requestAnimationFrame;

      return function() {
        var triggered    = false;
        var unsubscribed = false;
        var lastArgs     = null;

        var f = function() {
          lastArgs = arguments;

          if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

          if ( ! triggered ) {
            triggered = true;
            requestAnimationFrameX(
              function() {
                triggered = false;
                var args = argsToArray(lastArgs);
                lastArgs = null;
                try {
                  listener.apply(this, args);
                } catch (x) {
                  if ( x === EventService.UNSUBSCRIBE_EXCEPTION ) unsubscribed = true;
                }
              });
          }
        };

        if ( DEBUG ) f.toString = function() {
          return 'ANIMATE(' + listener.$UID + ', ' + listener + ')';
        };

        return f;
      }();
    },

    /** Decroate a listener so that the event is delivered asynchronously. **/
    async: function(listener, opt_X) {
      return this.delay(0, listener, opt_X);
    },

    delay: function(delay, listener, opt_X) {
      opt_X = opt_X || this.X;
      return function() {
        var args = argsToArray(arguments);

        // Is there a better way of doing this?
        (opt_X && opt_X.setTimeout ? opt_X.setTimeout : setTimeout)( function() { listener.apply(this, args); }, delay );
      };
    },

    hasListeners: function (opt_topic) {
      if ( ! opt_topic ) return !! this.subs_;

      console.log('TODO: haslisteners');
      // TODO:
      return true;
    },

    /**
     * Publish a notification to the specified topic.
     *
     * @return number of subscriptions notified
     **/
    publish: function (topic) {
      return this.subs_ ?
        this.pub_(
          this.subs_,
          0,
          topic,
          this.appendArguments([this, topic], arguments, 1)) :
        0;
    },

    /** Publish asynchronously. **/
    publishAsync: function (topic) {
      var args = argsToArray(arguments);
      var me   = this;

      setTimeout( function() { me.publish.apply(me, args); }, 0);
    },

    /**
     * Publishes a message to this object and all of its children.
     * Objects/Protos which have children should override the
     * standard definition, which is the same as just calling publish().
     **/
    deepPublish: function(topic) {
      return this.publish.apply(this, arguments);
    },

    /**
     * Publish a message supplied by a factory function.
     *
     * This is useful if the message is expensive to generate and you
     * don't want to waste the effort if there are no listeners.
     *
     * arg fn: function which returns array
     **/
    lazyPublish: function (topic, fn) {
      if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());

      return 0;
    },

    /** Subscribe to notifications for the specified topic. **/
    subscribe: function (topic, listener) {
      if ( ! this.subs_ ) this.subs_ = {};
      //console.log("Sub: ",this, listener);

      this.sub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe a listener from the specified topic. **/
    unsubscribe: function (topic, listener) {
      if ( ! this.subs_ ) return;

      this.unsub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe all listeners from this service. **/
    unsubscribeAll: function () {
      this.sub_ = {};
    },


    ///////////////////////////////////////////////////////
    //                                            Internal
    /////////////////////////////////////////////////////

    pub_: function(map, topicIndex, topic, msg) {
      /**
        map: topicMap, topicIndex: index into 'topic', topic: array of topic path
        return: number of listeners published to
       **/
      var count = 0;

      // There are no subscribers, so nothing to do
      if ( map == null ) return 0;

      if ( topicIndex < topic.length ) {
        var t = topic[topicIndex];

        // wildcard publish, so notify all sub-topics, instead of just one
        if ( t == this.WILDCARD )
          return this.notifyListeners_(topic, map, msg);

        if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
      }

      count += this.notifyListeners_(topic, map[null], msg);

      return count;
    },

    sub_: function(map, topicIndex, topic, listener) {
      if ( topicIndex == topic.length ) {
        if ( ! map[null] ) map[null] = [];
        map[null].push(listener);
      } else {
        var key = topic[topicIndex];

        if ( ! map[key] ) map[key] = {};

        this.sub_(map[key], topicIndex+1, topic, listener);
      }
    },

    unsub_: function(map, topicIndex, topic, listener) {
      /**
        map: topicMap, topicIndex: index into 'topic', topic: array of topic path
        return: true iff there are no subscritions for this topic left
      **/
      if ( topicIndex == topic.length ) {
        if ( ! map[null] ) return true;

        var i = map[null].indexOf(listener);
        if ( i == -1 ) {
          console.warn('phantom unsubscribe, size: ', map[null].length);
        } else {
          map[null] = map[null].spliceF(i, 1);
        }

        if ( ! map[null].length ) delete map[null];
      } else {
        var key = topic[topicIndex];

        if ( ! map[key] ) return false;

        if ( this.unsub_(map[key], topicIndex+1, topic, listener) )
          delete map[key];
      }
      return Object.keys(map).length == 0;
    },

    /** @return true if the message was delivered without error. **/
    notifyListener_: function(topic, listener, msg) {
      try {
        listener.apply(null, msg);
      } catch ( err ) {
        if ( err !== this.UNSUBSCRIBE_EXCEPTION ) {
          console.error('Error delivering event (removing listener): ', topic.join('.'), err);
          if ( DEBUG ) console.error(err.stack);
        } else {
          // console.warn('Unsubscribing listener: ', topic.join('.'));
        }

        return false;
      }

      return true;
    },

    /** @return number of listeners notified **/
    notifyListeners_: function(topic, listeners, msg) {
      if ( listeners == null ) return 0;

      if ( Array.isArray(listeners) ) {
        for ( var i = 0 ; i < listeners.length ; i++ ) {
          var listener = listeners[i];

          if ( ! this.notifyListener_(topic, listener, msg) ) {
            this.unsubscribe(topic, listener);
          }
        }

        return listeners.length;
      }

      var count = 0;
      for ( var key in listeners ) {
        count += this.notifyListeners_(topic, listeners[key], msg);
      }
      return count;
    },

    // convenience method to turn 'arguments' into a real array
    appendArguments: function (a, args, start) {
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

      return a;
    }
  }
});


/** Extend EventService with support for dealing with property-change notification. **/
MODEL({
  name: 'PropertyChangeSupport',

  extendsModel: 'EventService',

  constants: {
    /** Root for property topics. **/
    PROPERTY_TOPIC: 'property'
  },

  methods: {
    /** Create a topic for the specified property name. **/
    propertyTopic: memoize1(function (property) {
      return [ this.PROPERTY_TOPIC, property ];
    }),

    /** Indicate that a specific property has changed. **/
    propertyChange: function (property, oldValue, newValue) {
      // don't bother firing event if there are no listeners
      if ( ! this.subs_ ) return;

      // don't fire event if value didn't change
      if ( property != null && (
        oldValue === newValue ||
          (/*NaN check*/(oldValue !== oldValue) && (newValue !== newValue)) )
         ) return;

      this.publish(this.propertyTopic(property), oldValue, newValue);
    },

    propertyChange_: function (propertyTopic, oldValue, newValue) {
      // don't bother firing event if there are no listeners
      if ( ! this.subs_ ) return;

      // don't fire event if value didn't change
      if ( oldValue === newValue || (/*NaN check*/(oldValue !== oldValue) && (newValue !== newValue)) ) return;

      this.publish(propertyTopic, oldValue, newValue);
    },

    /** Indicates that one or more unspecified properties have changed. **/
    globalChange: function () {
      this.publish(this.propertyTopic(this.WILDCARD), null, null);
    },

    addListener: function(listener) {
      console.assert(listener, 'Listener cannot be null.');
      // this.addPropertyListener([ this.PROPERTY_TOPIC ], listener);
      this.addPropertyListener(null, listener);
    },

    removeListener: function(listener) {
      this.removePropertyListener(null, listener);
    },

    /** @arg property the name of the property to listen to or 'null' to listen to all properties. **/
    addPropertyListener: function(property, listener) {
      this.subscribe(this.propertyTopic(property), listener);
    },

    removePropertyListener: function(property, listener) {
      this.unsubscribe(this.propertyTopic(property), listener);
    },

    /** Create a Value for the specified property. **/
    propertyValue: function(prop) {
      if ( ! prop ) throw 'Property Name required for propertyValue().';
      var props = this.props_ || ( this.props_ = {} );
      return Object.hasOwnProperty.call(props, prop) ?
        props[prop] :
        ( props[prop] = PropertyValue.create(this, prop) );
    }
  }
});

var FunctionStack = {
  create: function() {
    var stack = [false];
    return {
      stack: stack,
      push: function(f) { stack.unshift(f); },
      pop: function() { stack.shift(); },
    };
  }
};


var Value = {
  __isValue__: true,
  isValue: function(o) { return o.__isValue__; }
};

var PropertyValue = {
  __proto__: Value,
  create: function(obj, prop) {
    var o = Object.create(this);
    o.$UID = obj.$UID + '.' + prop;
    o.obj  = obj;
    o.prop = prop;
    return o;
  },

  get: function() { return this.obj[this.prop]; },

  set: function(val) { this.obj[this.prop] = val; },

  // asDAO: function() {
  //   console.warn('ProperytValue.asDAO() deprecated.  Use property$Proxy instead.');
  //   if ( ! this.proxy ) {
  //     this.proxy = this.X.lookup('foam.dao.ProxyDAO').create({delegate: this.get()});
  //     this.addListener(function() { proxy.delegate = this.get(); }.bind(this));
  //   }
  //   return this.proxy;
  // },

  get value() { return this.get(); },

  set value(val) { this.set(val); },

  addListener: function(listener) { this.obj.addPropertyListener(this.prop, listener); },

  removeListener: function(listener) { this.obj.removePropertyListener(this.prop, listener); },

  toString: function () { return 'PropertyValue(' + this.prop + ')'; }
};


/** Static support methods for working with Events. **/
var Events = {

  /** Collection of all 'following' listeners. **/
  listeners_: new WeakMap(),

  recordListener: function(src, dst, listener, opt_dontCallListener) {
    var srcMap = this.listeners_.get(src);
    if ( ! srcMap ) {
      srcMap = new WeakMap();
      this.listeners_.set(src, srcMap);
    }
    console.assert( ! srcMap.get(dst), 'recordListener: duplicate follow');
    srcMap.set(dst, listener);
    src.addListener(listener);
    if ( ! opt_dontCallListener ) listener();
  },


  identity: function (x) { return x; },

  /** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
  follow: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    this.recordListener(srcValue, dstValue, function () {
      var sv = srcValue.get();
      var dv = dstValue.get();

      if ( ! equals(sv, dv) ) dstValue.set(sv);
    });
  },


  /** Have the dstValue stop listening for changes to the srcValue. **/
  unfollow: function (src, dst) {
    if ( ! src || ! dst ) return;
    var srcMap = this.listeners_.get(src);
    if ( ! srcMap ) return;
    var listener = srcMap.get(dst);
    if ( listener ) {
      srcMap.delete(dst);
      src.removeListener(listener);
    }
  },


  /**
   * Maps values from one model to another.
   * @param f maps values from srcValue to dstValue
   */
  map: function (srcValue, dstValue, f) {
    if ( ! srcValue || ! dstValue ) return;

    this.recordListener(srcValue, dstValue, function () {
      var s = f(srcValue.get());
      var d = dstValue.get();

      if ( ! equals(s, d) ) dstValue.set(s);
    });
  },


  /**
   * Link the values of two models by having them follow each other.
   * Initial value is copied from srcValue to dstValue.
   **/
  link: function (srcValue, dstValue) {
    this.follow(srcValue, dstValue);
    this.follow(dstValue, srcValue);
  },


  /**
   * Relate the values of two models.
   * @param f maps value1 to model2
   * @param fprime maps model2 to value1
   * @param removeFeedback disables feedback
   */
  relate: function (srcValue, dstValue, f, fprime, removeFeedback) {
    if ( ! srcValue || ! dstValue ) return;

    var feedback = false;

    var l = function(sv, dv, f) { return function () {
      if ( removeFeedback && feedback ) return;
      var s = f(sv.get());
      var d = dv.get();

      if ( ! equals(s, d) ) {
        feedback = true;
        dv.set(s);
        feedback = false;
      }
    }};

    var l1 = l(srcValue, dstValue, f);
    var l2 = l(dstValue, srcValue, fprime);

    this.recordListener(srcValue, dstValue, l1, true);
    this.recordListener(dstValue, srcValue, l2, true);

    l1();
  },

  /** Unlink the values of two models by having them no longer follow each other. **/
  unlink: function (value1, value2) {
    this.unfollow(value1, value2);
    this.unfollow(value2, value1);
  },


  //////////////////////////////////////////////////
  //                                   FRP Support
  //////////////////////////////////////////////////

  /**
   * Trap the dependencies of 'fn' and re-invoke whenever
   * their values change.  The return value of 'fn' is
   * passed to 'opt_fn'.
   * @param opt_fn also invoked when dependencies change,
   *        but its own dependencies are not tracked.
   * @returns a cleanup object. call ret.destroy(); to
   *        destroy the dynamic function and listeners.
   */
  dynamic: function(fn, opt_fn, opt_X) {
    var fn2 = opt_fn ? function() { opt_fn(fn()); } : fn;
    var listener = EventService.framed(fn2, opt_X);
    var propertyValues = [];
    fn(); // Call once before capture to pre-latch lazy values
    Events.onGet.push(function(obj, name, value) {
      // Uncomment next line to debug.
      // obj.propertyValue(name).addListener(function() { console.log('name: ', name, ' listener: ', listener); });
      obj.propertyValue(name).addListener(listener);
      propertyValues.push(obj.propertyValue(name));
    });
    var ret = fn();
    Events.onGet.pop();
    opt_fn && opt_fn(ret);
    return {
      destroy: function() { // TODO(jacksonic): just return the function?
        propertyValues.forEach(function(p) {
          p.removeListener(listener);
        });
      }
    };
  },

  onSet: FunctionStack.create(),
  onGet: FunctionStack.create(),

  // ???: would be nice to have a removeValue method
  // or maybe add an 'owner' property, combine with Janitor
}

// TODO: Janitor
/*
  subscribe(subject, topic, listener);
  addCleanupTask(fn)

  cleanup();

*/


MODEL({
  name: 'Movement',

  methods: {

    distance: function(x, y) { return Math.sqrt(x*x + y*y); },

    /** Combinator to create the composite of two functions. **/
    o: function(f1, f2) { return function(x) { return f1(f2(x)); }; },

    /** Combinator to create the average of two functions. **/
    avg: function(f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; },

    /** Combinator to create a progressive average of two functions. **/
    spline: function(f1, f2) { return function(x) { return (1-x)*f1(x) + x*f2(x); }; },

    /** Constant speed. **/
    linear: function(x) { return x; },

    /** Move to target value and then return back to original value. **/
    back: function(x) { return x < 0.5 ? 2*x : 2-2*x; },

    /** Start slow and accelerate until half-way, then start slowing down. **/
    accelerate: function(x) { return (Math.sin(x * Math.PI - Math.PI/2)+1)/2; },

    /** Start slow and ease-in to full speed. **/
    easeIn: function(a) {
      var v = 1/(1-a/2);
      return function(x) {
        var x1 = Math.min(x, a);
        var x2 = Math.max(x-a, 0);
        return (a ? 0.5*x1*(x1/a)*v : 0) + x2*v;
      };
    },

    /** Combinator to reverse behaviour of supplied function. **/
    reverse: function(f) { return function(x) { return 1-f(1-x); }; },

    /** Reverse of easeIn. **/
    easeOut: function(b) { return Movement.reverse(Movement.easeIn(b)); },

    /**
     * Cause an oscilation at the end of the movement.
     * @param b percentage of time to to spend bouncing [0, 1]
     * @param a amplitude of maximum bounce
     * @param opt_c number of cycles in bounce (default: 3)
     */
    oscillate:  function(b, a, opt_c) {
      var c = opt_c || 3;
      return function(x) {
        if ( x < (1-b) ) return x/(1-b);
        var t = (x-1+b)/b;
        return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
      };
    },

    /**
     * Cause an bounce at the end of the movement.
     * @param b percentage of time to to spend bouncing [0, 1]
     * @param a amplitude of maximum bounce
     */
    bounce:  function(b,a,opt_c) {
      var c = opt_c || 3;
      return function(x) {
        if ( x < (1-b) ) return x/(1-b);
        var t = (x-1+b)/b;
        return 1-(1-t)*2*a*Math.abs(Math.sin(2*c*Math.PI * t));
      };
    },
    bounce2: function(a) {
      var v = 1 / (1-a);
      return function(x) {
        if ( x < (1-a) ) return v*x;
        var p = (x-1+a)/a;
        return 1-(x-1+a)*v/2;
      };
    },

    /** Move backwards a% before continuing to end. **/
    stepBack: function(a) {
      return function(x) {
        return ( x < a ) ? -x : -2*a+(1+2*a)*x;
      };
    },

    /** Combination of easeIn and easeOut. **/
    ease: function(a, b) {
      return Movement.o(Movement.easeIn(a), Movement.easeOut(b));
    },

    seq: function(f1, f2) {
      return ( f1 && f2 ) ? function() { f1.apply(this, argsToArray(arguments)); f2(); } :
      f1 ? f1
        : f2 ;
    },

    liveAnimations_: 0,

    /** @return a latch function which can be called to stop the animation. **/
    animate: function(duration, fn, opt_interp, opt_onEnd, opt_X) {
      var requestAnimationFrameX = ( opt_X && opt_X.requestAnimationFrame ) || requestAnimationFrame;

      // console.assert( opt_X && opt_X.requestAnimationFrame, 'opt_X or opt_X.requestAnimationFrame not available');

      if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);
      var interp = opt_interp || Movement.linear;

      return function() {
        var ranges    = [];
        var stopped = false;

        function stop() {
          var onEnd = opt_onEnd;
          if ( ! stopped ) {
            Movement.liveAnimations_--;
            stopped = true;
            onEnd && onEnd();
            onEnd = null;

            if ( Movement.liveAnimations_ === 0 ) {
              var tasks = Movement.idleTasks_;
              if ( tasks && tasks.length > 0 ) {
                Movement.idleTasks_ = [];
                setTimeout(function() {
                  // Since this is called asynchronously, there might be a new
                  // animation. If so, queue up the tasks again.
                  var i;
                  if ( Movement.liveAnimations_ > 0 ) {
                    for ( i = 0 ; i < tasks.length ; i++ )
                      Movement.idleTasks_.push(tasks[i]);
                  } else {
                    for ( i = 0 ; i < tasks.length ; i++ ) tasks[i]();
                  }
                }, 20);
              }
            }
          }
        }

        if ( fn ) {
          Events.onSet.push(function(obj, name, value2) {
            ranges.push([obj, name, obj[name], value2]);
          });
          fn.apply(this, argsToArray(arguments));
          Events.onSet.pop();
        }

        var startTime = Date.now();

        function go() {
          if ( stopped ) return;
          var now = Date.now();
          var p   = interp((Math.min(now, startTime + duration)-startTime)/duration);
          var last = now >= startTime + duration;

          for ( var i = 0 ; i < ranges.length ; i++ ) {
            var r = ranges[i];
            var obj = r[0], name = r[1], value1 = r[2], value2 = r[3];

            obj[name] = last ? value2 : value1 + (value2-value1) * p;
          }

          if ( last ) stop(); else requestAnimationFrameX(go);
        }

        if ( ranges.length > 0 ) {
          Movement.liveAnimations_++;
          requestAnimationFrameX(go);
        } else {
          var setTimeoutX = ( opt_X && opt_X.setTimeout ) || setTimeout;
          setTimeoutX(stop, duration);
        }

        return stop;
      };
    },

    whenIdle: function(fn) {
      // Decorate a function to defer execution until no animations are running
      return function() {
        if ( Movement.liveAnimations_ > 0 ) {
          if ( ! Movement.idleTasks_ ) Movement.idleTasks_ = [];
          var args = arguments;
          Movement.idleTasks_.push(function() { fn.apply(fn, args); });
        } else {
          fn.apply(fn, arguments);
        }
      };
    },

    // requires unsubscribe to work first (which it does now)
    /*
      animate2: function(timer, duration, fn) {
      return function() {
      var startTime = timer.time;
      Events.onSet.push(function(obj, name, value2) {
      var value1 = obj[name];

      Events.dynamic(function() {
      var now = timer.time;

      obj[name] = value1 + (value2-value1) * (now-startTime)/duration;

      if ( now > startTime + duration ) throw EventService.UNSUBSCRIBE_EXCEPTION;
      });

      return false;
      });
      fn.apply(this, argsToArray(arguments));
      Events.onSet.pop();
      update();
      };
      },
    */

    // TODO: if this were an object then you could sub-class to modify playback
    compile: function (a, opt_rest) {
      function noop() {}

      function isPause(op) {
        return Array.isArray(op) && op[0] == 0;
      }

      function compilePause(op, rest) {
        return function() {
          document.onclick = function() {
            document.onclick = null;
            rest();
          };
        };
      }

      function isSimple(op) {
        return Array.isArray(op) && typeof op[0] === 'number';
      }

      function compileSimple(op, rest) {
        op[3] = Movement.seq(op[3], rest);
        return function() { Movement.animate.apply(null, op)(); };
      }

      function isParallel(op) {
        return Array.isArray(op) && Array.isArray(op[0]);
      }

      function compileParallel(op, rest) {
        var join = (function(num) {
          return function() { --num || rest(); };
        })(op.length);

        return function() {
          for ( var i = 0 ; i < op.length ; i++ )
            if ( isSimple(op[i]) )
              Movement.animate(op[i][0], op[i][1], op[i][2], Movement.seq(op[i][3], join))();
          else
            Movement.compile(op[i], join)();
        };
      }

      function compileFn(fn, rest) {
        return Movement.seq(fn, rest);
      }

      function compile_(a, i) {
        if ( i >= a.length ) return opt_rest || noop;

        var rest = compile_(a, i+1);
        var op = a[i];

        if ( isPause(op)    ) return compilePause(op, rest);
        if ( isSimple(op)   ) return compileSimple(op, rest);
        if ( isParallel(op) ) return compileParallel(op, rest);

        return compileFn(op, rest);
      }

      return compile_(a, 0);
    },

    onIntersect: function (o1, o2, fn) {
      if ( o1.model_.R ) {
        Events.dynamic(function() { o1.x; o1.y; o2.x; o2.y; }, function() {
          var dx = o1.x - o2.x;
          var dy = o1.y - o2.y;
          var d = dx*dx + dy*dy;
          var r2 = o1.r + o2.r;
          if ( d < r2*r2 )
            fn.call(null, o1, o2);
        });
      } else {
        Events.dynamic(function() { o1.x; o1.y; o2.x; o2.y; }, function() {
          if ( ( o1.x <= o2.x && o1.x + o1.width > o2.x    &&
                 o1.y <= o2.y && o1.y + o1.height > o2.y ) ||
               ( o2.x <= o1.x && o2.x + o2.width > o1.x    &&
                 o2.y <= o1.y && o2.y + o2.height > o1.y ) )
          {
            fn.call(null, o1, o2);
          }
        });
      }
    },

    stepTowards: function(src, dst, maxStep) {
      var dx = src.x - dst.x;
      var dy = src.y - dst.y;
      var theta = Math.atan2(dy,dx);
      var r     = Math.sqrt(dx*dx+dy*dy);
      r = r < 0 ? Math.max(-maxStep, r) : Math.min(maxStep, r);

      dst.x += r*Math.cos(-theta);
      dst.y -= r*Math.sin(-theta);
    },


    /**
     * Cause one object to move towards another at a specified rate.
     *
     * @arg t timer
     * @arg body body to be orbitted
     * @arg sat object to orbit body
     * @arg r radius of orbit
     * @arg p period of orbit
     */
    moveTowards: function (t, body, sat, v) {
      var bodyX = body.propertyValue('x');
      var bodyY = body.propertyValue('y');
      var satX  = sat.propertyValue('x');
      var satY  = sat.propertyValue('y');

      t.addListener(function() {
        var dx = bodyX.get() - satX.get();
        var dy = (bodyY.get() - satY.get());
        var theta = Math.atan2(dy,dx);
        var r     = Math.sqrt(dx*dx+dy*dy);

        r = r < 0 ? Math.max(-v, r) : Math.min(v, r);

        satX.set(satX.get() + r*Math.cos(-theta));
        satY.set(satY.get() - r*Math.sin(-theta));
      });
    },

    /**
     * Cause one object to orbit another.
     *
     * @arg t timer
     * @arg body body to be orbitted
     * @arg sat object to orbit body
     * @arg r radius of orbit
     * @arg p period of orbit
     */
    orbit: function (t, body, sat, r, p, opt_start) {
      var bodyX = body.x$;
      var bodyY = body.y$;
      var satX  = sat.x$;
      var satY  = sat.y$;
      var start = opt_start || 0;

      t.addListener(EventService.framed(function() {
        var time = t.time;
        satX.set(bodyX.get() + r*Math.sin(time/p*Math.PI*2 + start));
        satY.set(bodyY.get() + r*Math.cos(time/p*Math.PI*2 + start));
      }));
    },

    strut: function(mouse, c, dx, dy) {
      Events.dynamic(function() { mouse.x; mouse.y; }, function() {
        c.x = mouse.x + dx;
        c.y = mouse.y + dy;
      });
    },

    gravity: function(c, opt_a, opt_theta) {
      // TODO(kgr): implement opt_theta, the ability to control the direction
      var a = opt_a || 1;
      var theta = opt_theta || Math.PI * 1.5;
      Events.dynamic(function() { c.vx; c.vy; }, function() {
        c.vy += a;
      });
    },

    friction: function(c, opt_coef) {
      var coef = opt_coef || 0.9;
      Events.dynamic(function() { c.vx; c.vy; }, function() {
        c.vx = Math.abs(c.vx) < 0.001 ? 0 : c.vx * coef;
        c.vy = Math.abs(c.vy) < 0.001 ? 0 : c.vy * coef;
      });
    },

    inertia: function(c) {
      var last = Date.now();

      Events.dynamic(function() { c.vx; c.vy; c.x; c.y; }, function() {
        // Take into account duration since last run
        // Don't skip more than 4 frames because it can cause
        // collisions to be missed.
        var now = Date.now();
        var time = Math.min(Math.max(16, now-last), 64)/16;

        // Dynamic Friction
        if ( Math.abs(c.vx) > 0.001 ) c.x += c.vx * time;
        if ( Math.abs(c.vy) > 0.001 ) c.y += c.vy * time;

        // StaticFriction
//        if ( Math.abs(c.vx) < 0.001 ) c.vx = 0;
//        if ( Math.abs(c.vy) < 0.001 ) c.vy = 0;

        last = now;
      });
    },

    spring: function(mouse, c, dx, dy, opt_strength) {
      var strength = opt_strength || 6;
      var d        = Movement.distance(dx, dy);
      Events.dynamic(function() { mouse.x; mouse.y; c.x; c.y; c.vx; c.vy; }, function() {
        if ( dx === 0 && dy === 0 ) {
          c.x = mouse.x;
          c.y = mouse.y;
        } else {
          var dx2 = mouse.x + dx - c.x;
          var dy2 = mouse.y + dy - c.y;
          var d2  = Movement.distance(dx2, dy2);
          var dv  = strength * d2/d;
          if ( Math.abs(dv) < 0.01 ) return;
          var a = Math.atan2(dy2, dx2);
          c.vx += dv * Math.cos(a);
          c.vy += dv * Math.sin(a);
        }
      });
    },

    spring2: function(c1, c2, length, opt_strength) {
      var strength = opt_strength || 4;

      Events.dynamic(function() { c1.x; c1.y; c2.x; c2.y; }, function() {
        var d = c1.distanceTo(c2);
        var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
        if ( d > length ) {
          c1.applyMomentum( strength * (d/length-1), a);
          c2.applyMomentum(-strength * (d/length-1), a);
        } else if ( d < length ) {
          c1.applyMomentum(-strength * (length/d-1), a);
          c2.applyMomentum( strength * (length/d-1), a);
        }
      });
    },

    createAnimatedPropertyInstallFn: function(duration, interpolation) {
      /* Returns a function that can be assigned as a $$DOC{ref:'Property'}
      $$DOC{ref:'Property.install'} function. Any assignments to the property
      will be automatically animated.</p>
      <p><code>
      properties: [
      &nbsp;&nbsp;  { name: 'myProperty',
      &nbsp;&nbsp;&nbsp;&nbsp;    install: createAnimatedPropertyInstallFn(500, Movement.ease(0.2, 0.2)),
      &nbsp;&nbsp;&nbsp;&nbsp;    ...
      &nbsp;&nbsp;  }]
      </code>*/
      return function(prop) {
        this.defineProperty(
          {
            name: prop.name+"$AnimationLatch",
            defaultValue: 0,
            hidden: true,
            documentation: function() { /* The animation controller. */ },
          }
        );

        var actualSetter = this.__lookupSetter__(prop.name);
        this.defineProperty(
          {
            name: prop.name+"$AnimationSetValue",
            defaultValue: 0,
            hidden: true,
            documentation: function() { /* The animation value setter. */ },
            postSet: function(_, nu) {
              actualSetter.call(this, nu);
            }
          }
        );

        // replace setter with animater
        this.__defineSetter__(prop.name, function(nu) {
          // setter will be called on the instance, so "this" is an instance now
          var latch = this[prop.name+"$AnimationLatch"] ;
          latch && latch();

          var anim = Movement.animate(
            duration,
            function() {
              this[prop.name+"$AnimationSetValue"] = nu;
            }.bind(this),
            interpolation
          );
          this[prop.name+"$AnimationLatch"] = anim();
        });
      };
    }
  }
});

Movement.easy = Movement.spline(
  Movement.spline(constantFn(0), Movement.linear),
  Movement.spline(Movement.linear, constantFn(1)));
