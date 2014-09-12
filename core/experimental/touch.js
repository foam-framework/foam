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


MODEL({
  name: 'InputPoint',
  properties: [
    'id', 'type',
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
      help: 'The real latest X-coordinate. pageX, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.dx = nu - old;
        this.xHistory.push(nu);
        this.totalX = nu - this.x0;
      }
    },
    {
      name: 'y',
      help: 'The real latest Y-coordinate. pageY, relative to the whole document, in CSS pixels.',
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

    init: function() {
      this.SUPER();
      if ( this.X.document ) this.install(this.X.document);
    },

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
        type: 'touch',
        x: t.pageX,
        y: t.pageY
      });
      this.publish(this.TOUCH_START, this.touches[i]);
    },
    touchMove: function(i, t, e) {
      this.touches[i].x = t.pageX;
      this.touches[i].y = t.pageY;
      this.publish(this.TOUCH_MOVE, this.touches[i]);
    },
    touchEnd: function(i, t, e) {
      this.touches[i].x = t.pageX;
      this.touches[i].y = t.pageY;
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
  name: 'ScrollGesture',
  help: 'Gesture that understands vertical or horizontal scrolling.',

  properties: [
    {
      name: 'name',
      defaultValueFn: function() { return this.direction + 'Scroll'; }
    },
    {
      name: 'direction',
      defaultValue: 'vertical'
    },
    'handlers'
  ],

  methods: {
    makeAxis: function(point, xy) {
      return {
        current: point[xy],
        prop: point[xy + '$'],
        start: point[xy + '0'],
        delta: point['d' + xy],
        total: point['total' + xy.capitalize()],
        history: point[xy + 'History']
      };
    },
    getPrimaryAxis: function(point) {
      return this.makeAxis(point, this.direction == 'vertical' ? 'y' : 'x');
    },
    getSecondaryAxis: function(point) {
      return this.makeAxis(point, this.direction == 'vertical' ? 'x' : 'y');
    },

    recognize: function(map) {
      // I recognize:
      // - a single point that
      // - is touch, not mouse and
      // - is not done and
      // - has moved at least 10px in the primary direction

      if ( Object.keys(map).length !== 1 ) return false;
      var point = map[Object.keys(map)[0]];

      return point.type != 'mouse' && ! point.done &&
          Math.abs(this.getPrimaryAxis(point).total) > 10;
    },

    attach: function(map, handlers) {
      var point = map[Object.keys(map)[0]];
      this.handlers = handlers || [];

      var axis = this.getPrimaryAxis(point);
      axis.prop.addListener(this.onDelta);
      point.done$.addListener(this.onDone);

      // Now send the start and subsequent events to all the handlers.
      // This is essentially replaying the history for all the handlers,
      // now that we've been recognized.
      // In this particular case, all three handlers are called with dy, totalY, and y.
      // The handlers are {vertical,horizontal}Scroll{Start,Move,End}.
      this.pingHandlers(this.direction + 'ScrollStart', 0, 0, axis.start);
      for ( var i = 1 ; i < axis.history.length ; i++ ) {
        this.pingHandlers(
          this.direction + 'ScrollMove',
          axis.history[i] - axis.history[i-1],
          axis.history[i] - axis.start,
          axis.current
        );
      }
    },

    pingHandlers: function(method, d, t, c) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        var h = this.handlers[i];
        h && h[method] && h[method](d, t, c);
      }
    }
  },

  listeners: [
    {
      name: 'onDelta',
      code: function(obj, prop, old, nu) {
        var axis = this.getPrimaryAxis(obj);
        this.pingHandlers(this.direction + 'ScrollMove', axis.delta, axis.total, axis.current);
      }
    },
    {
      name: 'onDone',
      code: function(obj, prop, old, nu) {
        var axis = this.getPrimaryAxis(obj);
        axis.prop.removeListener(this.onDelta);
        obj.done$.removeListener(this.onDone);
        this.pingHandlers(this.direction + 'ScrollEnd', axis.delta, axis.total, axis.current);
      }
    }
  ]
});

MODEL({
  name: 'TapGesture',
  help: 'Gesture that understands a quick, possible multi-point tap. Calls into the handler: tapClick(numberOfPoints).',

  properties: [
    {
      name: 'name',
      defaultValue: 'tap'
    },
    'handlers'
  ],

  methods: {
    recognize: function(map) {
      // I recognize:
      // - multiple points that
      // - are all done and
      // - none of which has moved more than 10px net.

      return Object.keys(map).every(function(key) {
        var p = map[key];
        return p.done && Math.abs(p.totalX) < 10 && Math.abs(p.totalY) < 10;
      });
    },

    attach: function(map, handlers) {
      // Nothing to listen for; the tap has already fired when this recognizes.
      // Just sent the tapClick(numberOfPoints) message to the handlers.
      if  ( ! handlers || ! handlers.length ) return;
      var points = Object.keys(map).length;
      handlers.forEach(function(h) {
        h && h.tapClick && h.tapClick(points);
      });
    }
  }
});

MODEL({
  name: 'DragGesture',
  help: 'Gesture that understands a hold and drag with mouse or one touch point.',
  properties: [
    {
      name: 'name',
      defaultValue: 'drag'
    }
  ],

  methods: {
    recognize: function(map) {
      // I recognize:
      // - a single point that
      // - is not done and
      // - has begun to move
      // I conflict with: vertical and horizontal scrolling, when using touch.
      if ( Object.keys(map).length > 1 ) return;
      var point = map[Object.keys(map)[0]];
      var r = point.dx !== 0 || point.dy !== 0;
      return r;
    },

    attach: function(map, handlers) {
      // My callbacks take the form: function(point) {}
      // And I call dragStart and dragEnd on the handler.
      // There is no dragMove; bind to the point to follow its changes.
      var point = map[Object.keys(map)[0]];
      this.handlers = handlers || [];

      point.done$.addListener(this.onDone);

      // Now send the start event to all the handlers.
      this.pingHandlers('dragStart', point);
    },

    pingHandlers: function(method, point) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        var h = this.handlers[i];
        h && h[method] && h[method](point);
      }
    }
  },

  listeners: [
    {
      name: 'onDone',
      code: function(obj, prop, old, nu) {
        obj.done$.removeListener(this.onDone);
        this.pingHandlers('dragEnd', obj);
      }
    }
  ]
});

MODEL({
  name: 'PinchTwistGesture',
  help: 'Gesture that understands a two-finger pinch/stretch and rotation',
  properties: [
    {
      name: 'name',
      defaultValue: 'pinchTwist'
    },
    'handlers', 'points'
  ],

  methods: {
    getPoints: function(map) {
      var keys = Object.keys(map);
      return [map[keys[0]], map[keys[1]]];
    },

    recognize: function(map) {
      // I recognize:
      // - two points that
      // - are both not done and
      // - have begun to move.
      if ( Object.keys(map).length !== 2 ) return;

      var points = this.getPoints(map);
      return ! points[0].done &&
             ! points[1].done &&
             ( points[0].dx !== 0 || points[0].dy !== 0 ) &&
             ( points[1].dx !== 0 || points[1].dy !== 0 );
    },

    attach: function(map, handlers) {
      // I have three callbacks:
      // function pinchStart();
      // function pinchMove(scale, rotation);
      // function pinchEnd();
      // Scale is a unitless scaling factor, relative to the **start of the gesture**.
      // Rotation is degrees clockwise relative to the **start of the gesture**.
      // That is, these values are net totals since the gesture began,
      // they are not incremental between pinchMove calls, or absolute to the page.
      // A user of this gesture should save the original values on pinchStart,
      // and adjust them by the values from each pinchMove to update the UI.
      // See demos/pinchgesture.html.
      this.points = this.getPoints(map);
      this.handlers = handlers || [];

      this.points.forEach(function(p) {
        p.x$.addListener(this.onMove);
        p.y$.addListener(this.onMove);
        p.done$.addListener(this.onDone);
      }.bind(this));

      // Now send the start event to all the handlers.
      this.pingHandlers('pinchStart');
      this.onMove();
    },

    pingHandlers: function(method, scale, rotation) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        var h = this.handlers[i];
        h && h[method] && h[method](scale, rotation);
      }
    },

    distance: function(x1, y1, x2, y2) {
      var dx = x2 - x1;
      var dy = y2 - y1;
      return Math.sqrt(dx*dx + dy*dy);
    }
  },

  listeners: [
    {
      name: 'onMove',
      code: function() {
        var oldDist = this.distance(this.points[0].x0, this.points[0].y0,
                                    this.points[1].x0, this.points[1].y0);
        var newDist = this.distance(this.points[0].x, this.points[0].y,
                                    this.points[1].x, this.points[1].y);
        var scale = newDist / oldDist;

        // These are values from -pi to +pi.
        var oldAngle = Math.atan2(this.points[1].y0 - this.points[0].y0, this.points[1].x0 - this.points[0].x0);
        var newAngle = Math.atan2(this.points[1].y - this.points[0].y, this.points[1].x - this.points[0].x);
        var rotation = newAngle - oldAngle;
        while ( rotation < - Math.PI ) rotation += 2 * Math.PI;
        while ( rotation > Math.PI ) rotation -= 2 * Math.PI;
        // That's in radians, so I'll convert to degrees.
        rotation *= 360;
        rotation /= 2 * Math.PI;

        this.pingHandlers('pinchMove', scale, rotation);
      }
    },
    {
      name: 'onDone',
      code: function(obj, prop, old, nu) {
        this.points.forEach(function(p) {
          p.x$.removeListener(this.onMove);
          p.y$.removeListener(this.onMove);
          p.done$.removeListener(this.onDone);
        });
        this.pingHandlers('pinchEnd');
      }
    }
  ]
});


MODEL({
  name: 'GestureTarget',
  help: 'Created by each view that wants to receive gestures.',
  properties: [
    {
      name: 'gesture',
      help: 'The name of the gesture to be tracked.'
    },
    {
      name: 'container',
      help: 'The containing object. The GestureManager will call containsPoint() on it.'
    },
    {
      name: 'getElement',
      help: 'Function to retrieve the element this gesture is attached to. Defaults to container.$.',
      defaultValue: function() { return this.container.$; }
    },
    {
      name: 'handler',
      help: 'The target for the gesture\'s events, after it has been recognized.'
    }
  ],

  methods: {
    // TODO: Add support for this to CView2.
    containsPoint: function(point) {
      return this.container.containsPoint(point.x, point.y,
          this.X.document.elementFromPoint(point.x, point.y));
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
          verticalScroll: ScrollGesture.create(),
          horizontalScroll: ScrollGesture.create({ direction: 'horizontal' }),
          tap: TapGesture.create(),
          drag: DragGesture.create(),
          pinchTwist: PinchTwistGesture.create()
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
      factory: function() { return {}; }
    },
    {
      name: 'recognized',
      help: 'Set to the recognized gesture. Cleared when all points are lifted.'
    },
    {
      name: 'points',
      factory: function() { return {}; }
    },
    'wheelTimer',
    {
      name: 'scrollWheelTimeout',
      defaultValue: 300
    },
    {
      name: 'scrollViewTargets',
      defaultValue: 0
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // TODO: Mousewheel and mouse down/up events.
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_START, this.onTouchStart);
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_MOVE,  this.onTouchMove);
      this.X.touchManager.subscribe(this.X.touchManager.TOUCH_END,   this.onTouchEnd);
      this.X.document.addEventListener('mousedown', this.onMouseDown);
      this.X.document.addEventListener('mousemove', this.onMouseMove);
      this.X.document.addEventListener('mouseup', this.onMouseUp);
      this.X.document.addEventListener('wheel', this.onWheel);
      this.X.document.addEventListener('contextmenu', this.onContextMenu);
    },

    install: function(target) {
      // Check for dupes first. Nothing sophisticated, just checking if the
      // GestureTarget is === to any already registered. There are no
      // circumstances where double-registering an identical target is good.
      for ( var i = 0 ; i < this.targets.length ; i++ ) {
        if ( this.targets[i] === target ) {
          console.warn('duplicate gesture target installation - not cleaning up?');
          return;
        }
      }

      this.targets.push(target);
    },
    uninstall: function(target) {
      this.targets.deleteI(target);
    },

    debug_tag: function() {
      this.targets.forEach(function(x) { x.seen = true; });
    },
    debug_sweep: function() {
      this.targets.forEach(function(x) { if ( x.seen ) { console.log(x); } });
    },

    checkRecognition: function() {
      if ( this.recognized ) return;
      var self = this;
      var match;
      // TODO: Handle multiple matching gestures.
      Object.keys(this.active).forEach(function(name) {
        if ( self.gestures[name].recognize(self.points) ) {
          match = name;
        }
      });

      if ( ! match ) return;

      // Filter all the handlers to make sure none is a child of any already existing.
      // This prevents eg. two tap handlers firing when the tap is on an inner one.
      var matched = this.active[match];
      var legal = [];
      for ( var i = 0 ; i < matched.length ; i++ ) {
        var m = matched[i].getElement();
        var contained = 0;
        for ( var j = 0 ; j < matched.length ; j++ ) {
          var n = matched[j].getElement();
          if ( m !== n && m.contains(n) ) {
            contained++;
          }
        }

        if ( contained === 0 ) legal.push(matched[i].handler);
      }
      // There will always be at least one survivor here.

      this.gestures[match].attach(this.points, legal);
      this.recognized = this.gestures[match];
    },

    // Clears all state in the gesture manager.
    // This is a blunt instrument, use with care.
    resetState: function() {
      this.active = [];
      this.recognized = null;
      this.points = {};
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(_, __, touch) {
        // If we've already recognized, it's up to that code to handle the new point.
        if ( this.recognized ) {
          this.recognized.addPoint && this.recognized.addPoint(touch);
          return;
        }

        // Check if there are any active points already.
        var pointCount = Object.keys(this.points).length;
        if ( ! pointCount ) {
          // Check rectangles, since this is the first point.
          for ( var i = 0 ; i < this.targets.length ; i++ ) {
            if ( this.targets[i].containsPoint(touch) ) {
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
      name: 'onMouseDown',
      code: function(event) {
        // Build the InputPoint for it.
        var point = InputPoint.create({
          id: 'mouse',
          type: 'mouse',
          x: event.pageX,
          y: event.pageY
        });

        // TODO: De-dupe me with the code above in onTouchStart.
        if ( this.recognized ) {
          this.recognized.addPoint(point);
          return;
        }

        var pointCount = Object.keys(this.points).length;
        if ( ! pointCount ) {
          // Check rectangles for this first point.
          for ( var i = 0 ; i < this.targets.length ; i++ ) {
            if ( this.targets[i].containsPoint(point) ) {
              var g = this.gestures[this.targets[i].gesture];
              if ( ! g ) continue;
              if ( ! this.active[g.name] ) this.active[g.name] = [];
              this.active[g.name].push(this.targets[i]);
            }
          }
        }

        this.points[point.id] = point;
        this.checkRecognition();
      }
    },
    {
      name: 'onTouchMove',
      code: function(_, __, touch) {
        if ( this.recognized ) return;
        this.checkRecognition();
      }
    },
    {
      name: 'onMouseMove',
      code: function(event) {
        // No reaction unless we have an active mouse point.
        if ( ! this.points.mouse ) return;
        // If one does exist, update its coordinates.
        this.points.mouse.x = event.pageX;
        this.points.mouse.y = event.pageY;
        this.checkRecognition();
      }
    },
    {
      name: 'onTouchEnd',
      code: function(_, __, touch) {
        if ( ! this.recognized ) {
          this.checkRecognition();
        }

        delete this.points[touch.id];
        this.active = {}
        this.recognized = undefined;
      }
    },
    {
      name: 'onMouseUp',
      code: function(event) {
        // TODO: De-dupe me too.
        if ( ! this.points.mouse ) return;
        this.points.mouse.done = true;
        if ( ! this.recognized ) {
          this.checkRecognition();
        }

        delete this.points.mouse;
        this.active = {}
        this.recognized = undefined;
      }
    },
    {
      name: 'onWheel',
      code: function(event) {
        if ( this.wheelTimer ) {
          // Wheel is already active. Just update.
          this.points.wheel.x -= event.deltaX;
          this.points.wheel.y -= event.deltaY;
          this.X.window.clearTimeout(this.wheelTimer);
          this.wheelTimer = this.X.window.setTimeout(this.onWheelDone, this.scrollWheelTimeout);
        } else {
          // Do nothing if we're currently recognizing something else.
          if ( this.recognized || Object.keys(this.points).length > 0) return;

          // New wheel event. Create an input point for it.
          var wheel = InputPoint.create({
            id: 'wheel',
            type: 'wheel',
            x: event.pageX,
            y: event.pageY
          });

          // Now immediately feed this to the appropriate ScrollGesture.
          var gesture = Math.abs(event.deltaX) > Math.abs(event.deltaY) ?
              'horizontalScroll' : 'verticalScroll';
          // Find all targets for that gesture and check their rectangles.
          this.active[gesture] = [];
          for ( var i = 0 ; i < this.targets.length ; i++ ) {
            if ( this.targets[i].gesture === gesture &&
                this.targets[i].containsPoint(wheel) ) {
              this.active[gesture].push(this.targets[i]);
            }
          }

          // And since wheel events are already moving, include the deltas immediately.
          // We have to do this after checking rectangles, or a downward (negative)
          // scroll too close to the top of the rectangle will fail.
          wheel.x -= event.deltaX;
          wheel.y -= event.deltaY;

          if ( this.active[gesture].length ) {
            this.points.wheel = wheel;
            this.gestures[gesture].attach(this.points, this.active[gesture].map(function(gt) {
              return gt.handler;
            }));
            this.recognized = this.gestures[gesture];
            this.wheelTimer = this.X.window.setTimeout(this.onWheelDone,
                this.scrollWheelTimeout);
          }
        }
      }
    },
    {
      name: 'onWheelDone',
      code: function() {
        this.wheelTimer = undefined;
        this.points.wheel.done = true;
        delete this.points.wheel;
        this.recognized = undefined;
      }
    },
    {
      name: 'onContextMenu',
      code: function() {
        // Fired when the user right-clicks to open a context menu.
        // When this happens, we clear state, since sometimes after the context menu,
        // we get a broken event sequence.
        this.resetState();
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

