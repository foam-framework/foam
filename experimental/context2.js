var GLOBAL = GLOBAL || this;

var Context = {
    subCtx: function(opt_map) {
       var ctx = opt_map || {};
       ctx.__proto__ = this; // TODO: should this be $X
       return ctx;;
    },
    subCtxForWindow: function(window, opt_map) {
	return {
           __proto__: opt_map ? this.subCtx(opt_map) : this,
           window: window,
           document: window.document,
           console: window.console,
           log: window.console.log.bind(window.console),
           setTimeout: function(fn, delay) {
              return window.setTimeout(this.xfn(fn), delay);
           },
           clearTimeout: window.clearTimeout.bind(window),
           setInterval: function(fn, delay) {
              return window.setInterval(this.xfn(fn), delay);
           },
           clearInterval: window.clearInterval.bind(window),
           requestAnimationFrame: function(fn) {
              window.requestAnimationFrame(this.xfn(fn));
           }
        };
    },
    subCtxForGlobal: function(global, opt_map) {
	return {
           __proto__: opt_map ? this.subCtx(opt_map) : this,
           console: global.console,
           log: global.console.log.bind(global.console),
           setTimeout: function(fn, delay) {
              return global.setTimeout(this.xfn(fn), delay);
           },
           clearTimeout: global.clearTimeout.bind(global),
           setInterval: function(fn, delay) {
              return global.setInterval(this.xfn(fn), delay);
           },
           clearInterval: global.clearInterval.bind(global),
           requestAnimationFrame: function(fn) {
              global.setTimeout(this.xfn(fn), 16);
           }
        };
    },
    /** Curry the supplied function so that it always runs in this Context. **/
    xfn: function(fn) {
      return this.xwith.bind(this, fn);
    },
    /** Run the supplied function in this Context. **/
    xwith: function(fn) {
       var ret;
       var oldX = X;
       LOBBY.$X = this;
       try {
          ret = fn();
       } catch (x) {
          LOBBY.$X = oldX;
       }

       return ret;
    }
};


var LOBBY = {
   // $X psedo-property represents the current Context.
   get $X() { return LOBBY.__proto__; },
   set $X(x) { LOBBY.__proto__ = x; },

   // Enter into a window context.
   $Window: function(window) {
      LOBBY.__proto__ = Context.subCtxForWindow(window);
   },
   // Enter into a global non-window context.
   $Global: function(window) {
      LOBBY.__proto__ = Context.subCtxForGlobal(window);
   },
   $subCtx: function(opt_map) {
     LOBBY.$X = LOBBY.subCtx(opt_map);
   },
   subCtx: function(opt_map) { return LOBBY.$X.subCtx(opt_map); },
   xfn: function(fn) { return LOBBY.$X.xfn(fn); },
   xwith: function(fn) { return LOBBY.$X.xwith(fn); }
};


// Attach the global 'window'
LOBBY.$Window(window);

// Everything should be run in the LOBBY
with ( LOBBY ) {
  console.log($X); // the current Context

  // create and enter explicit subContext
  $X = $X.subCtx({
     a: 3
  });
  setInterval(function() { log(a); }, 1000);

  // create and enter implicit subContext
  $X = subCtx({
     a: 4
  });
  setInterval(function() { log(a); }, 1000);

  // short-form
  $subCtx({
     a: 5,
     log: function(a) { console.log('extra: ', a); }
  });
  setInterval(function() { log(a); }, 1000);

}


