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

// http://www.republicofcode.com/tutorials/flash/as3tweenclass/
// http://mootools.net/docs/core/Fx/Fx.Transitions
// http://jquery.malsup.com/cycle/adv.html

/** Publish and Subscribe Event Notification Service. **/
// ??? Whould 'Observable' be a better name?
var EventService = {

  /** If listener thows this exception, it will be removed. **/
  UNSUBSCRIBE_EXCEPTION: 'unsubscribe',


  /** Used as topic suffix to specify broadcast to all sub-topics. **/
  WILDCARD: "*",


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
    var delay = opt_delay || 16;

    return function() {
      var STACK        = null;
      var triggered    = false;
      var unsubscribed = false;
      var lastArgs     = null;

      var f = function() {
        STACK = DEBUG_STACK();
        lastArgs = arguments;

        if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( ! triggered ) {
          triggered = true;
          try {
            ((opt_X && opt_X.setTimeout) || setTimeout)(
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

      f.toString = function() {
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
  animate: function(listener, opt_X) {
//    if ( ! opt_X ) debugger;
//    if ( opt_X.isBackground ) debugger;

    return function() {
      var STACK        = null;
      var triggered    = false;
      var unsubscribed = false;
      var lastArgs     = null;

      var f = function() {
        STACK = DEBUG_STACK();
        lastArgs = arguments;

        if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( ! triggered ) {
          triggered = true;
          ((opt_X && opt_X.requestAnimationFrame) || requestAnimationFrame)(
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

      f.toString = function() {
        return 'ANIMATE(' + listener.$UID + ', ' + listener + ')';
      };

      return f;
    }();
  },

  /** Decroate a listener so that the event is delivered asynchronously. **/
  async: function(listener) {
    return this.delay(0, listener);
  },

  delay: function(delay, listener) {
    return function() {
      var args = argsToArray(arguments);

      // Is there a better way of doing this?
      setTimeout( function() { listener.apply(this, args); }, delay );
    };
  },

  hasListeners: function (topic) {
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
    if ( topicIndex == topic.length ) {
      if ( ! map[null] ) return true;

      if ( ! map[null].deleteI(listener) ) {
        console.warn('phantom unsubscribe');
      } else {
//        console.log('remove', topic);
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


  /** @return number of listeners notified **/
  notifyListeners_: function(topic, listeners, msg) {
    if ( listeners == null ) return 0;

    if ( Array.isArray(listeners) ) {
      for ( var i = 0 ; i < listeners.length ; i++ ) {
        var listener = listeners[i];

        try {
          listener.apply(null, msg);
        } catch ( err ) {
          if ( err !== this.UNSUBSCRIBE_EXCEPTION ) {
            console.error('Error delivering event (removing listener): ', topic.join('.'));
          } else {
            console.warn('Unsubscribing listener: ', topic.join('.'));
          }
          listeners.splice(i,1);
          i--;
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

};


/** Extend EventService with support for dealing with property-change notification. **/
var PropertyChangeSupport = {

  __proto__: EventService,

  /** Root for property topics. **/
  PROPERTY_TOPIC: 'property',

  /** Create a topic for the specified property name. **/
  propertyTopic: function (property) {
    return [ this.PROPERTY_TOPIC, property ];
  },


  /** Indicate that a specific property has changed. **/
  propertyChange: function (property, oldValue, newValue) {
    // don't bother firing event if there are no listeners
    if ( ! this.subs_ ) return;

    // don't fire event if value didn't change
    if ( property != null && oldValue === newValue ) return;

    this.publish(this.propertyTopic(property), oldValue, newValue);
  },

  propertyChange_: function (propertyTopic, oldValue, newValue) {
    // don't bother firing event if there are no listeners
    if ( ! this.subs_ ) return;

    // don't fire event if value didn't change
    if ( oldValue === newValue ) return;

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
    var obj  = this;
    var name = prop + 'Value___';
    var proxy;

    return Object.hasOwnProperty.call(obj, name) ? obj[name] : ( obj[name] = {
      $UID: obj.$UID + "." + prop,

      get: function() { return obj[prop]; },

      set: function(val) { obj[prop] = val; },

      asDAO: function() {
        if ( ! proxy ) {
          proxy = ProxyDAO.create({delegate: this.get()});

          this.addListener(function() { proxy.delegate = this.get(); }.bind(this));
        }

        return proxy;
      },

      get value() { return this.get(); },

      set value(val) { this.set(val); },

      addListener: function(listener) {
        obj.addPropertyListener(prop, listener);
      },

      removeListener: function(listener) {
        obj.removePropertyListener(prop, listener);
      },

      toString: function () { return 'PropertyValue(' + prop + ')'; }
    } );
  }

};


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


/** Static support methods for working with Events. **/
var Events = {

  /** Collection of all 'following' listeners. **/
  listeners_: {},

  identity: function (x) { return x; },

  /** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
  follow: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    var listener = function () {
      var sv = srcValue.get();
      var dv = dstValue.get();

      if ( sv !== dv ) dstValue.set(sv);
    };

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    srcValue.addListener(listener);

    listener();
  },


  /**
   * Maps values from one model to another.
   * @param f maps values from srcValue to dstValue
   */
  map: function (srcValue, dstValue, f) {
    if ( ! srcValue || ! dstValue ) return;

    var listener = function () {
      var s = f(srcValue.get());
      var d = dstValue.get();

      if ( s !== d ) dstValue.set(s);
    };

    listener();

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    srcValue.addListener(listener);
  },


  /** Have the dstValue stop listening for changes to the srcValue. **/
  unfollow: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    var key      = [srcValue.$UID, dstValue.$UID];
    var listener = this.listeners_[key];

    if ( listener ) {
      delete this.listeners_[key];
      srcValue.removeListener(listener);
    }
  },


  /**
   * Link the values of two models by having them follow each other.
   * Initial value is copied from srcValue to dstValue.
   **/
  link: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

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

      if ( s !== d ) {
        feedback = true;
        dv.set(s);
        feedback = false;
      }
    }};

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    var l1 = l(srcValue, dstValue, f);
    var l2 = l(dstValue, srcValue, fprime);

    srcValue.addListener(l1);
    dstValue.addListener(l2);

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
   */
  dynamic: function(fn, opt_fn, opt_X) {
    var fn2 = opt_fn ? function() { opt_fn(fn()); } : fn;
    var listener = EventService.animate(fn2, opt_X);
    Events.onGet.push(function(obj, name, value) {
      // Uncomment next line to debug.
      // obj.propertyValue(name).addListener(function() { console.log('name: ', name); });
      obj.propertyValue(name).addListener(listener);
    });
    var ret = fn();
    Events.onGet.pop();
    opt_fn && opt_fn(ret);
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

Function.prototype.o = function(f2) {
  var f1 = this;
  return function() { return f1.call(this, f2.apply(this, argsToArray(arguments))); };
};


var Movement = {

  distance: function(x, y) { return Math.sqrt(x*x + y*y); },

  /** Combinator to create the composite of two functions. **/
  o: function(f1, f2) { return function(x) { return f1(f2(x)); }; },

  /** Combinator to create the average of two functions. **/
  avg: function(f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; },

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

  /** @return a latch function which can be called to stop the animation. **/
  animate: function(duration, fn, opt_interp, opt_onEnd) {
    if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);
    var interp = opt_interp || Movement.linear;

    return function() {
      var STACK     = DEBUG_STACK();
      var ranges    = [];
      var timer;

      function stop() {
        clearInterval(timer);
        opt_onEnd && opt_onEnd();
        opt_onEnd = null;
      }

      if ( fn ) {
        Events.onSet.push(function(obj, name, value2) {
          ranges.push([obj, name, obj[name], value2]);
        });
        fn.apply(this, argsToArray(arguments));
        Events.onSet.pop();
      }

      var startTime = Date.now();

      if ( ranges.length > 0 ) {
        timer = setInterval(function() {
          var now = Date.now();
          var p   = interp((Math.min(now, startTime + duration)-startTime)/duration);

          for ( var i = 0 ; i < ranges.length ; i++ ) {
            var r = ranges[i];
            var obj = r[0], name = r[1], value1 = r[2], value2 = r[3];

            obj[name] = value1 + (value2-value1) * p;
          }

          if ( now >= startTime + duration ) stop();
        }, 16);
      } else {
        timer = setInterval(stop, duration);
      }

      return stop;
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

    t.addListener(EventService.animate(function() {
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

  friction: function(c, opt_coef) {
    var coef = opt_coef || 0.9;
    Events.dynamic(function() { c.vx; c.vy; }, function() {
      c.vx *= coef;
      c.vy *= coef;
    });
  },

  inertia: function(c) {
    Events.dynamic(function() { c.vx; c.vy; c.x; c.y; }, function() {
      // Dynamic Friction
      c.x += c.vx;
      c.y += c.vy;
      // StaticFriction
      if ( c.x < 0.1 ) c.x = 0;
      if ( c.y < 0.1 ) c.y = 0;
    });
  },

  spring: function(mouse, c, dx, dy, opt_strength) {
    var strength = opt_strength || 8;
    Events.dynamic(function() { mouse.x; mouse.y; c.x; c.y; }, function() {
      if ( dx === 0 && dy === 0 ) {
        c.x = mouse.x;
        c.y = mouse.y;
      } else {
        var d   = Movement.distance(dx, dy);
        var dx2 = mouse.x + dx - c.x;
        var dy2 = mouse.y + dy - c.y;
        var d2  = Movement.distance(dx2, dy2);
        var dv  = strength * d2/d;
        var a   = Math.atan2(dy2, dx2);
        c.vx += dv * Math.cos(a);
        c.vy += dv * Math.sin(a);
      }
    });
  }

};
