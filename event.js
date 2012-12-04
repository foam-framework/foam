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

// todo: add enabled/disabled support
// todo: bind
// todo: generateTopic()
// todo: cleanup empty topics after subscriptions removed

// http://www.republicofcode.com/tutorials/flash/as3tweenclass/
// http://mootools.net/docs/core/Fx/Fx.Transitions
// http://jquery.malsup.com/cycle/adv.html

/** Publish and Subscribe Event Notification Service. **/
var EventService = {

    /** If listener thows this exception, it will be removed. **/
    UNSUBSCRIBE_EXCEPTION: 'unsubscribe',


    /** Used as topic suffix to specify broadcast to all sub-topics. **/
    WILDCARD: "*",


    /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
    oneTime: function(listener) {
       return function() {
	  listener.apply(this, arguments);

	  throw EventService.UNSUBSCRIBE_EXCEPTION;
       };
    },


    /** Log all listener invocations to console. **/
    consoleLog: function(listener) {
       return function() {
	  console.log(arguments);

	  listener.apply(this, arguments);
       };
    },


    /**
     * Merge all notifications occuring in the specified time window into a single notification.
     * Only the last notification is delivered.
     *
     * @param opt_delay time in milliseconds of time-window, defaults to 16ms, which is
     *        the smallest delay that humans aren't able to perceive.
     **/
    merged: function(listener, opt_delay) {
       var delay = opt_delay || 16;

       return function() {
	  var triggered = false;
	  var lastArgs  = null;

	  return function() {
	     lastArgs = arguments;

	     if ( ! triggered ) {
		triggered = true;

		setTimeout(
		   function() {
		      triggered = false;
		      var args = lastArgs;
		      lastArgs = null;

		      listener.apply(this, args);
		   },
		   delay);
	     }
	  };
       }();
    },


    /** Decroate a listener so that the event is delivered asynchronously. **/
    async: function(listener) {
      return this.delay(0, listener);
    },

    delay: function(delay, listener) {
       return function() {
	  var args = arguments;

	  // Is there a better way of doing this?
	  setTimeout( function() { listener.apply(this, args); }, delay );
       };
    },

    hasListeners: function (topic) {
       // todo:
       return true;
    },


    /**
     * Publish a notification to the specified topic.
     *
     * @return number of subscriptions notified
     **/
    publish: function (topic) {
       return this.pub_(this.subs_, 0, topic, this.appendArguments([this, topic], arguments, 1));
    },


    /** Publish asynchronously. **/
    publishAsync: function (topic) {
       var args = arguments;
       var me   = this;

       setTimeout( function() { me.publish.apply(me, args); }, 0 );
    },


    // TODO: alternate name: lazyPublish
    // fn: function which returns array
    publishLazy: function (topic, fn) {
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

	   count += this.pub_(map[t], topicIndex+1, topic, msg);
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

            map[null].remove(listener);

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

       if ( listeners instanceof Array ) {
	  for ( var i = 0 ; i < listeners.length ; i++ ) {
	     var listener = listeners[i];

             try {
		listener.apply(null, msg);
	     } catch ( err ) {
		if ( err == this.UNSUBSCRIBE_EXCEPTION ) {
		   listeners.splice(i,1);
		   i--;
		}
	     }
	  }

	  return listeners.length;
       }

       for ( var key in listeners ) {
	  return this.notifyListeners_(topic, listeners[key], msg);
       }
    },


    // convenience method to turn 'arguments' into a real array
    appendArguments: function (a, args, start) {
       for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

       return a;
    }

}


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
      // don't fire event if value didn't change
      if ( property != null && oldValue == newValue ) return;

      this.publish(this.propertyTopic(property), oldValue, newValue);
   },


   /** Indicates that one or more unspecified properties have changed. **/
   globalChange: function () {
      this.publish(this.propertyTopic(this.WILDCARD), null, null);
   },


   addListener: function(listener) {
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
      // TODO
   },


   /** Create a Value for the specified property. **/
   propertyValue: function(property) {
      var obj = this;

      return {
	 get: function() { return obj[property]; },

	 set: function(val) { obj[property] = val; },

	 addListener: function(listener) {
	    obj.addPropertyListener(property, listener);
	 },

	 removeListener: function(listener) {
	    obj.removePropertyListener(property, listener);
	 },

 	 toString: function () {
	    return "PropertyValue(" + obj + "," + property + ")";
	 }
      };
   }

}


/** Static support methods for working with Events. **/
var Events = {

    /** Collection of all 'following' listeners. **/
    listeners_: {},

    identity: function (x) { return x; },

    /** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
    follow: function (srcValue, dstValue) {
       if ( ! srcValue || ! dstValue ) return;

       dstValue.set(srcValue.get());

       var listener = function () {
	  dstValue.set(srcValue.get());
       };

       this.listeners_[[srcValue, dstValue]] = listener;

       srcValue.addListener(listener);
    },


    /**
     * Maps values from one model to another.
     * @param f maps values from srcValue to dstValue
     */
    map: function (srcValue, dstValue, f) {
       if ( ! srcValue || ! dstValue ) return;

       var listener = function () {
	  dstValue.set(f(srcValue.get()));
       };

       listener(); // copy initial value

       this.listeners_[[srcValue, dstValue]] = listener;

       srcValue.addListener(listener);
    },


    /** Have the dstValue stop listening for changes to the srcValue. **/
    unfollow: function (srcValue, dstValue) {
       if ( ! srcValue || ! dstValue ) return;

       var key      = [srcValue, dstValue];
       var listener = this.listeners_[key];

       delete this.listeners_[key];

       srcValue.removeListener(listener);
    },


    /** Link the values of two models by having them follow each other.  Initial value is copied from value1 to model2. **/
    link: function (value1, model2) {
       this.follow(value1, model2);
       this.follow(model2, value1);
    },


    /**
     * Relate the values of two models.
     * @param f maps value1 to model2
     * @param fprime maps model2 to value1
     */
    relate: function (value1, value2, f, fprime) {
       this.map(value1, value2, f);
       this.map(value2, value1, fprime);
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
   dynamic: function(fn, opt_fn) {
     var fn2 = opt_fn ? function() { fn(opt_fn()); } : fn;
     var oldOnGet = Events.onGet;
     var listener = EventService.merged(fn2, 5);
     Events.onGet = function(obj, name, value)
     {
       obj.propertyValue(name).addListener(listener);
     };
     var ret = fn();
     Events.onGet = oldOnGet;
     opt_fn && opt_fn(ret);
   },


   onSet: function(obj, name, newValue) {
     return true;
   },

   onGet: function(obj, name, value) {
   }

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
  return function() { return f1.call(this, f2.apply(this, arguments)); };
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
   oscillate:  function(b,a,opt_c) {
     var c = opt_c || 3;
     return function(x) {
       if ( x < (1-b) ) return x/(1-b);
       var t = (x-1+b)/b;
       return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
     };
   },

   /**
    * Cause an bounce at the end of the movement.
    * @param a percentage of time to to spend bouncing [0, 1)
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
     return ( f1 && f2 ) ? function() { f1.apply(this, arguments); f2(); } :
                      f1 ? f1
                         : f2 ;
   },

   animate: function(duration, fn, opt_interp, opt_onEnd) {
     if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);

     var interp = opt_interp || Movement.linear;

     return function() {
       var startTime = Date.now();
       var oldOnSet  = Events.onSet;
       var ranges = [];

       Events.onSet = function(obj, name, value2) {
         ranges.push([obj, name, obj[name], value2]);
       };
       fn && fn.apply(this, arguments);
       Events.onSet = oldOnSet;

       if ( ranges.length > 0 || true ) {
         var timer = setInterval(function() {
           var now = Math.min(Date.now(), startTime + duration);
           var p   = interp((now-startTime)/duration);

           for ( var i = 0 ; i < ranges.length ; i++ ) {
             var r = ranges[i];
             var obj = r[0];
             var name = r[1];
             var value1 = r[2];
             var value2 = r[3];

             obj[name] = value1 + (value2-value1) * p;
           }

           if ( now >= startTime + duration ) {
             clearTimeout(timer);
             opt_onEnd && opt_onEnd();
           }
         }, 30);
       }
     };
   },

   // requires unsubscribe to work first
   animate2: function(timer, duration, fn) {
     return function() {
     var startTime = timer.time;
     var oldOnSet  = Events.onSet;
     Events.onSet = function(obj, name, value2)
     {
       var value1 = obj[name];

       Events.dynamic(function() {
         var now = timer.time;

         obj[name] = value1 + (value2-value1) * (now-startTime)/duration;

         if ( now > startTime + duration ) throw EventService.UNSUBSCRIBE_EXCEPTION;
       });

       return false;
     };
     fn.apply(this, arguments);
     Events.onSet = oldOnSet;
     update();
     };
   },

   // TODO: if this were an object then you could sub-class to modify playback
   compile: function (a, opt_rest) {
     function noop() {}

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

       if ( isSimple(op)   ) return compileSimple(op, rest);
       if ( isParallel(op) ) return compileParallel(op, rest);

       return compileFn(op, rest);
     }

     return compile_(a, 0);
   },


   onIntersect: function (o1, o2, fn) {

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
    orbit: function (t, body, sat, r, p)
    {
       var bodyX = body.propertyValue('x');
       var bodyY = body.propertyValue('y');
       var satX  = sat.propertyValue('x');
       var satY  = sat.propertyValue('y');

       t.addListener(function() {
          var time = t.time;
	  satX.set(bodyX.get() + r*Math.sin(time/p*Math.PI*2));
	  satY.set(bodyY.get() + r*Math.cos(time/p*Math.PI*2));
       });
    }

};
