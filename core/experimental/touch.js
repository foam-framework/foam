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

Object.defineProperties(Touch.prototype, {
  offsetX: {
    get: function() {
      return this.clientX - this.target.getBoundingClientRect().left;
    }
  },
  offsetY: {
    get: function() {
      return this.clientY - this.target.getBoundingClientRect().top;
    }
  }
});

MODEL({
  name: 'InputPoint',
  properties: [
    'id',
    { name: 'done', model_: 'BooleanProperty' },
    {
      name: 'xHistory',
      // TODO: factories don't work here because they don't get called until after the x/y postSets
      getter: function() {
        if ( this.instance_.xHistory ) return this.instance_.xHistory;
        this.instance_.xHistory = [];
        return this.instance_.xHistory;
      }
    },
    {
      name: 'yHistory',
      getter: function() {
        if ( this.instance_.yHistory ) return this.instance_.yHistory;
        this.instance_.yHistory = [];
        return this.instance_.yHistory;
      }
    },
    {
      name: 'x',
      help: 'The real latest X-coordinate. offsetX, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.dx = nu - old;
        this.xHistory.push(nu);
        this.totalX = nu - this.x0;
      }
    },
    {
      name: 'y',
      help: 'The real latest Y-coordinate. offsetY, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.dy = nu - old;
        this.yHistory.push(nu);
        this.totalY = nu - this.y0;
      }
    },
    { name: 'x0', getter: function() { return this.xHistory[0]; } },
    { name: 'y0', getter: function() { return this.yHistory[0]; } },
    'dx', 'dy', 'totalX', 'totalY'
  ]
});

MODEL({
  name: 'TouchManager',

  properties: [
    { name: 'touches', factory: function() { return {}; } }
  ],

  methods: {
    TOUCH_START: ['touch-start'],
    TOUCH_END: ['touch-end'],
    TOUCH_MOVE: ['touch-move'],

    // TODO: Problems if the innermost element actually being touched is removed from the DOM.
    // Change this to connect the touchstart only to the document, and the others on the fly
    // after the first touch, to event.target.
    install: function(d) {
      d.addEventListener('touchstart', this.onTouchStart);
      d.addEventListener('touchend', this.onTouchEnd);
      d.addEventListener('touchmove', this.onTouchMove);
      d.addEventListener('touchcancel', this.onTouchCancel);
      d.addEventListener('touchleave', this.onTouchLeave);
    },

    touchStart: function(i, t, e) {
      this.touches[i] = this.X.InputPoint.create({
        id: i,
        x: t.offsetX,
        y: t.offsetY
      });
      this.publish(this.TOUCH_START, this.touches[i]);
    },
    touchMove: function(i, t, e) {
      this.touches[i].x = t.offsetX;
      this.touches[i].y = t.offsetY;
      this.publish(this.TOUCH_MOVE, this.touches[i]);
    },
    touchEnd: function(i, t, e) {
      this.touches[i].x = t.offsetX;
      this.touches[i].y = t.offsetY;
      this.touches[i].done = true;
      this.publish(this.TOUCH_END, this.touches[i]);
      delete this.touches[i];
    },
    touchCancel: function(i, t, e) {
      this.touches[i].done = true;
      this.publish(this.TOUCH_END, this.touches[i]);
    },
    touchLeave: function(i, t, e) {
      this.touches[i].done = true;
      this.publish(this.TOUCH_END, this.touches[i]);
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          this.touchStart(t.identifier, t, e);
        }
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
        e.preventDefault();

        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          var id = t.identifier;
          if ( ! this.touches[id] ) {
            console.warn('Touch move for unknown touch.');
            continue;
          }
          this.touchMove(id, t, e);
        }
      }
    },
    {
      name: 'onTouchEnd',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          var id = t.identifier;
          if ( ! this.touches[id] ) {
            console.warn('Touch end for unknown touch.');
            continue;
          }
          this.touchEnd(id, t, e);
        }
      }
    },
    {
      name: 'onTouchCancel',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          var id = t.identifier;
          if ( ! this.touches[id] ) {
            console.warn('Touch cancel for unknown touch.');
            continue;
          }
          this.touchCancel(id, t, e);
        }
      }
    },
    {
      name: 'onTouchLeave',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          var id = t.identifier;
          if ( ! this.touches[id] ) {
            console.warn('Touch cancel for unknown touch.');
            continue;
          }
          this.touchLeave(id, t, e);
        }
      }
    }
  ]
});

// GESTURES

MODEL({
  name: 'Gesture',
  help: 'Installed in the GestureManager to watch for a particular kind of gesture',

  properties: [
    { name: 'name', required: true }
  ],

  methods: {
    recognize: function(map) {
      return false; // Returns true to indicate recognition, false to ignore.
    },

    attach: function(handlers) {
      // Called on recognition, with the array of handlers listening to this gesture.
      // Usually there's just one, but it could be multiple.
      // Each gesture defines its own callbacks for these handlers.
    },

    newPoint: function(point) {
      // A new point to stick into the map. Most gestures can ignore this.
      // Only called after recognition of this gesture.
    }

    /*
    // TODO: Am I necessary? FOAM listening to the properties on the points works well.
    update: function(changedTouches) {
      // Only called after this gesture has been recognized.
      // Called each time one of the points has updated. Given the ids of the changed points.
    }
    */
  }
});


MODEL({
  name: 'VerticalScrollGesture',
  help: 'Gesture that understands vertical scrolling. Calls into the handler ',

  properties: [
    {
      name: 'name',
      defaultValue: 'verticalScroll'
    },
    'handlers'
  ],

  methods: {
    recognize: function(map) {
      // I recognize:
      // - a single point that
      // - is not done and
      // - has moved at least 10px vertically, and
      // - less than 10px horizontally.

      if ( Object.keys(map).length > 1 ) return false;

      var point = map[Object.keys(map)[0]];

      return ! point.done && Math.abs(point.totalX) < 10 && Math.abs(point.totalY) > 10;
    },

    attach: function(map, handlers) {
      var point = map[Object.keys(map)[0]];
      this.handlers = handlers || [];
      point.y$.addListener(this.onDeltaY);
      point.done$.addListener(this.onDone);

      // Now send the start and subsequent events to all the handlers.
      // This is essentially replaying the history for all the handlers,
      // now that we've been recognized.
      // In this particular case, all three handlers are called with dy, totalY, and y.
      // The handlers are verticalScroll{Start,Move,End}.
      this.pingHandlers('verticalScrollStart', 0, 0, point.y0);
      for ( var i = 1 ; i < point.yHistory.length ; i++ ) {
        this.pingHandlers(
          'verticalScrollMove',
          point.yHistory[i] - point.yHistory[i-1],
          point.yHistory[i] - point.y0,
          point.y
        );
      }
    },

    pingHandlers: function(method, dy, ty, y) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        var h = this.handlers[i];
        h && h[method] && h[method](dy, ty, y);
      }
    }
  },

  listeners: [
    {
      name: 'onDeltaY',
      code: function(obj, prop, old, nu) {
        this.pingHandlers('verticalScrollMove', obj.dy, obj.totalY, obj.y);
      }
    },
    {
      name: 'onDone',
      code: function(obj, prop, old, nu) {
        obj.y$.removeListener(this.onDeltaY);
        obj.done$.removeListener(this.onDone);
        this.pingHandlers('verticalScrollEnd', obj.dy, obj.totalY, obj.y);
      }
    }
  ]
});

MODEL({
  name: 'GestureTarget',
  properties: [
    'x', 'y', 'w', 'h',
    'handler', 'gesture',
    {
      name: 'element',
      help: 'Convenience for setting the bounding rect of this target to be a DOM element',
      setter: function(e) {
        this.x      = e.offsetTop;
        this.y      = e.offsetLeft;
        this.width  = e.offsetWidth;
        this.height = e.offsetHeight;
      }
    }
  ],

  methods: {
    inside: function(p) {
      return this.x <= p.x && this.y <= p.y &&
          p.x <= this.x + this.width &&
          p.y <= this.y + this.height;
    }
  }
});

MODEL({
  name: 'GestureManager',
  properties: [
    {
      name: 'gestures',
      factory: function() {
        return {
          verticalScroll: VerticalScrollGesture.create({ manager: this })
        };
      }
    },
    {
      name: 'targets',
      help: 'GestureTargets that are waiting for gestures',
      factory: function() { return []; }
    },
    {
      name: 'active',
      help: 'Gestures that are active right now and should be checked for recognition. ' +
          'This is the gestures active on the FIRST touch. ' +
          'Rectangles are not checked for subsequent touches.',
      factory: function() { return []; }
    },
    {
      name: 'recognized',
      help: 'Set to the recognized gesture. Cleared when all points are lifted.'
    },
    {
      name: 'points',
      factory: function() { return {}; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // TODO: Mousewheel and mouse down/up events.
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_START, this.onTouchStart);
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_MOVE,  this.onTouchMove);
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_END,   this.onTouchEnd);
    },

    install: function(target) {
      this.targets.push(target);
    },

    checkRecognition: function() {
      if ( this.recognized ) return;
      var self = this;
      var match;
      Object.keys(this.active).forEach(function(name) {
        if ( self.gestures[name].recognize(self.points) ) {
          match = name;
        }
      });

      if ( ! match ) return;

      this.gestures[match].attach(
          this.points,
          this.active[match].map(function(gt) {
            return gt.handler;
          }));
      this.recognized = this.gestures[match];
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(_, _, touch) {
        // If we've already recognized, it's up to that code to handle the new point.
        if ( this.recognized ) {
          this.recognized.addPoint(touch);
          return;
        }

        // Check if there are any active points already.
        var pointCount = Object.keys(this.points).length;
        if ( ! pointCount ) {
          // Check rectangles, since this is the first point.
          for ( var i = 0 ; i < this.targets.length ; i++ ) {
            if ( this.targets[i].inside(touch) ) {
              var g = this.gestures[this.targets[i].gesture];
              if ( ! g ) continue;
              if ( ! this.active[g.name] ) this.active[g.name] = [];
              this.active[g.name].push(this.targets[i]);
            }
          }
        }

        // Either way, add this to the map and check for recognition.
        this.points[touch.id] = touch;
        this.checkRecognition();
      }
    },
    {
      name: 'onTouchMove',
      code: function(_, _, touch) {
        if ( this.recognized ) return;
        this.checkRecognition();
      }
    },
    {
      name: 'onTouchEnd',
      code: function(_, _, touch) {
        delete this.points[touch.id];
        if ( Object.keys(this.points).length === 0 ) {
          this.recognized = undefined;
        } else {
          this.checkRecognition();
        }
      }
    }
  ]
});


/*
MODEL({
  name: 'MomentumTouch',
  extendsModel: 'FOAMTouch',

  properties: [
    { name: 'vsamples', factory: function() { return []; } },
    'vX', 'vY',
    'curX','curY',
    'lastX','lastY',
    { model_: 'BooleanProperty', name: 'touching', factory: function() { return true; } },
    { model_: 'BooleanProperty', name: 'finished', factory: function() { return false; } },
    'a',
    'asamples',
    't',
    'last',
    { name: 'decel', factory: function() { return 0.002; } }
  ],

  methods: {
    start: function(t) {
      this.touching = true;
      this.finished = false;
      this.lastX = t.screenX;
      this.lastY = t.screenY;
      this.vX = 0;
      this.vY = 0;
      this.x = t.screenX;
      this.y = t.screenY;
      this.move(t);
    },

    move: function(t) {
      this.curX = t.screenX;
      this.curY = t.screenY;
    },

    end: function(t) {
      this.move(t);
      this.touching = false;
      this.lastTick = 0;
    },

    cancel: function(t) {
    },

    tick: function() {
      if ( ! this.lastTick ) {
        this.lastTick = this.X.performance.now();
        this.lastX = this.curX;
        this.lastY = this.curY;
        return;
      }

      var t = this.X.performance.now();
      var deltaT = t - this.lastTick;
      this.lastTick = t;

      if ( this.touching ) {
        var deltaX = this.curX - this.lastX;
        var deltaY = this.curY - this.lastY;

        this.lastX = this.curX;
        this.lastY = this.curY;

        var vX = deltaX / deltaT;
        var vY = deltaY / deltaT;

        var signX = vX < 0 ? -1 : 1;
        var signY = vY < 0 ? -1 : 1;

        this.x = this.curX;
        this.y = this.curY;

        var vsamples = this.vsamples;
        var vnewest = [vX, vY];
        vsamples.push(vnewest);

        var length = vsamples.length;

        if ( length > 3 ) { vsamples.shift(); length--; }

        var voldest = vsamples[0];
        var oldSignX = vX < 0 ? -1 : 1;
        var oldSignY = vY < 0 ? -1 : 1;

        if ( oldSignX !== signX ||
             oldSignY !== signY ) {
          vsamples = [vnewest];
          length = 1;
        }

        this.vsamples = vsamples;

//        this.vX = vnewest[0];
//        this.vY = vnewest[1];
        this.vX = this.vX - voldest[0]/length + vnewest[0]/length;
        this.vY = this.vY - voldest[1]/length + vnewest[1]/length;
      } else {
        var deltaV = this.decel * deltaT;
        vX = this.vX;
        vY = this.vY;

        this.x = this.x + vX * deltaT;
        this.y = this.y + vY * deltaT;

        var signX = vX < 0 ? -1 : 1;
        var signY = vY < 0 ? -1 : 1;

        if ( Math.abs(deltaV) > Math.abs(vX) ) vX = 0;
        else vX = signX * ( Math.abs(vX) - deltaV );
        if ( Math.abs(deltaV) > Math.abs(vY) ) vY = 0;
        else vY = signY * ( Math.abs(vY) - deltaV );

        this.vX = vX;
        this.vY = vY;

        if ( this.vX === 0 && this.vY === 0 ) this.finished = true;
      }
    }
  }
});


MODEL({
  name: 'MomentumTouchManager',
  extendsModel: 'TouchManager',

  properties: [
    'interval',
    { model_: 'IntProperty', name: 'period', defaultValue: 0 },
  ],

  methods: {
    touchStart: function(i, t, e) {
      this.SUPER(i, t, e);
      if ( ! this.interval )
        this.interval = this.X.setInterval(this.physicsLoop, this.period);
    },
    touchMove: function(i, t, e) {
      this.touches[i].move(t)
    },
    touchEnd: function(i, t, e) {
      this.touches[i].end(t);
    },
    touchCancel: function(i, t, e) {
      this.touches[i].cancel(t);
    },
    touchLeave: function(i, t, e) {
    }
  },

  listeners: [
    {
      name: 'physicsLoop',
      code: function() {
        var keys = Object.keys(this.touches);
        if ( keys.length === 0 ) {
          this.X.clearInterval(this.interval);
          this.interval = 0;
          return;
        }

        var touches = this.touches;
        for ( var i = 0; i < keys.length; i++ ) {
          var key = keys[i];
          var touch = touches[key];

          if ( touch.finished ) {
            this.publish(this.TOUCH_END, touch);
            delete touches[key];
          }

          touch.tick();
        }
        this.touches = touches;
      }
    }
  ]
});
*/

