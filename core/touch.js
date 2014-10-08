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
      name: 'x',
      documentation: 'The real latest X-coordinate. pageX, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.lastX = old;
      }
    },
    {
      name: 'y',
      documentation: 'The real latest Y-coordinate. pageY, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.lastY = old;
      }
    },
    {
      name: 'x0',
      documentation: 'The first X-coordinate. pageX, relative to the whole document, in CSS pixels. Set to x at creation time.',
      factory: function() { return this.x; }
    },
    {
      name: 'y0',
      documentation: 'The first Y-coordinate. pageY, relative to the whole document, in CSS pixels. Set to y at creation time.',
      factory: function() { return this.y; }
    },
    {
      name: 'lastX',
      documentation: 'The immediately previous X-coordinate. pageX, relative to the whole document, in CSS pixels. Set to x at creation time.',
      factory: function() { return this.x; }
    },
    {
      name: 'lastY',
      documentation: 'The immediately previous Y-coordinate. pageY, relative to the whole document, in CSS pixels. Set to y at creation time.',
      factory: function() { return this.y; }
    },
    {
      name: 'dx',
      getter: function() { return this.x - this.lastX; }
    },
    {
      name: 'dy',
      getter: function() { return this.y - this.lastY; }
    },
    {
      name: 'totalX',
      getter: function() { return this.x - this.x0; }
    },
    {
      name: 'totalY',
      getter: function() { return this.y - this.y0; }
    },
    'lastTime'
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
    },

    attach: function(e) {
      e.addEventListener('touchmove', this.onTouchMove);
      e.addEventListener('touchend', this.onTouchEnd);
      e.addEventListener('touchcancel', this.onTouchCancel);
      e.addEventListener('touchleave', this.onTouchEnd);
    },

    detach: function(e) {
      e.removeEventListener('touchmove', this.onTouchMove);
      e.removeEventListener('touchend', this.onTouchEnd);
      e.removeEventListener('touchcancel', this.onTouchCancel);
      e.removeEventListener('touchleave', this.onTouchEnd);
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

      // On touchMoves only, set the lastTime.
      // This is used by momentum scrolling to find the speed at release.
      this.touches[i].lastTime = this.X.performance.now();

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
        // Attach an element-specific touch handlers, in case it gets removed
        // from the DOM.
        this.attach(e.target);

        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          this.touchStart(t.identifier, t, e);
        }
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
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
        if ( e.cancelable ) e.preventDefault();
        this.detach(e.target);

        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          var id = t.identifier;
          if ( ! this.touches[id] ) {
            console.warn('Touch end for unknown touch ' + id, Object.keys(this.touches));
            continue;
          }
          this.touchEnd(id, t, e);
        }
      }
    },
    {
      name: 'onTouchCancel',
      code: function(e) {
        this.detach(e.target);

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
        this.detach(e.target);

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
      factory: function() {
        return this.direction + 'Scroll' + ( this.momentumEnabled ? 'Momentum' : this.nativeScrolling ? 'Native' : '' );
      }
    },
    {
      name: 'direction',
      defaultValue: 'vertical'
    },
    {
      name: 'isVertical',
      factory: function() { return this.direction === 'vertical'; }
    },
    {
      name: 'momentumEnabled',
      defaultValue: false,
      help: 'Set me to true (usually by attaching the "verticalScrollMomentum" gesture) to enable momentum'
    },
    {
      name: 'nativeScrolling',
      defaultValue: false,
      help: 'Set me to true (usually by attaching the "verticalScrollNative" gesture) to enable native browser scrolling'
    },
    {
      name: 'dragCoefficient',
      help: 'Each frame, the momentum will be multiplied by this coefficient. Higher means LESS drag.',
      defaultValue: 0.94
    },
    {
      name: 'dragClamp',
      help: 'The speed threshold (pixels/millisecond) below which the momentum drops to 0.',
      defaultValue: 0.05
    },
    {
      name: 'momentum',
      help: 'The current speed, in pixels/millisecond, at which the scroller is sliding.',
      defaultValue: 0
    },
    {
      name: 'lastTime',
      help: 'The performance.now() value for the last time we computed the momentum slide.',
      hidden: true,
      defaultValue: 0
    },
    {
      name: 'tickRunning',
      help: 'True when the physics tick should run.',
      hidden: true,
      defaultValue: false
    },
    'handlers'
  ],

  methods: {
    recognize: function(map) {
      // I recognize:
      // - a single point that
      // - is touch, not mouse and
      // - is not done and
      // - has moved at least 10px in the primary direction
      // OR
      // - is a single point that
      // - is touch, not mouse, and
      // - is not done and
      // - we are moving with momentum

      if ( Object.keys(map).length !== 1 ) return false;
      var point = map[Object.keys(map)[0]];

      return point.type != 'mouse' && ! point.done &&
          ( Math.abs(this.isVertical ? point.totalY : point.totalX) > 10 ||
            Math.abs(this.momentum) > 0 );
    },

    attach: function(map, handlers) {
      var point = map[Object.keys(map)[0]];
      this.handlers = handlers || [];

      if ( this.nativeScrolling ) {
        for ( var i = 0 ; i < this.handlers.length ; i++ ) {
          if ( this.handlers[i].attachScrollEvent ) {
            this.handlers[i].attachScrollEvent();
          }
        }
        return;
      }

      (this.isVertical ? point.y$ : point.x$).addListener(this.onDelta);
      point.done$.addListener(this.onDone);

      // If we're already scrolling with momentum, we let the user adjust that momentum with their touches.
      if ( this.momentum === 0 ) {
        // Now send the start and subsequent events to all the handlers.
        // This is essentially replaying the history for all the handlers,
        // now that we've been recognized.
        // In this particular case, all three handlers are called with dy, totalY, and y.
        // The handlers are {vertical,horizontal}Scroll{Start,Move,End}.
        //
        // TODO(braden): Maybe change this to make the last parameter the current?
        // That will prevent a first-frame jump with a large delta.
        this.pingHandlers(this.direction + 'ScrollStart', 0, 0, this.isVertical ? point.y0 : point.x0);
      } else {
        this.tickRunning = false;
      }
    },

    pingHandlers: function(method, d, t, c) {
      for ( var i = 0 ; i < this.handlers.length ; i++ ) {
        var h = this.handlers[i];
        h && h[method] && h[method](d, t, c, this.stopMomentum);
      }
    },

    sendEndEvent: function(point) {
      var delta = this.isVertical ? point.dy : point.dx;
      var total = this.isVertical ? point.totalY : point.totalX;
      var current = this.isVertical ? point.y : point.x;
      this.pingHandlers(this.direction + 'ScrollEnd', delta, total, current);
    },

    calculateInstantaneousVelocity: function(point) {
      // Compute and return the instantaneous velocity, which is
      // the primary axis delta divided by the time it took.
      // Our unit for velocity is pixels/millisecond.
      var now = this.X.performance.now();
      var lastTime = this.tickRunning ? this.lastTime : point.lastTime;
      var velocity = (this.isVertical ? point.dy : point.dx) / (now - point.lastTime);
      if ( this.tickRunning ) this.lastTime = now;

      return velocity;
    }
  },

  listeners: [
    {
      name: 'onDelta',
      code: function(obj, prop, old, nu) {
        if ( this.momentumEnabled ) {
          // If we're already moving with momentum, we simply add the delta between
          // the currently momentum velocity and the instantaneous finger velocity.
          var velocity = this.calculateInstantaneousVelocity(obj);
          var delta = velocity - this.momentum;
          this.momentum += delta;
        }
        var delta = this.isVertical ? obj.dy : obj.dx;
        var total = this.isVertical ? obj.totalY : obj.totalX;
        var current = this.isVertical ? obj.y : obj.x;
        this.pingHandlers(this.direction + 'ScrollMove', delta, total, current);
      }
    },
    {
      name: 'onDone',
      code: function(obj, prop, old, nu) {
        (this.isVertical ? obj.y$ : obj.x$).removeListener(this.onDelta);
        obj.done$.removeListener(this.onDone);

        if ( this.momentumEnabled ) {
          if ( Math.abs(this.momentum) < this.dragClamp ) {
            this.momentum = 0;
            this.sendEndEvent(obj);
          } else {
            this.tickRunning = true;
            this.lastTime = this.X.performance.now();
            this.tick(obj);
          }
        } else {
          this.sendEndEvent(obj);
        }
      }
    },
    {
      name: 'tick',
      isFramed: true,
      code: function(touch) {
        // First, check if momentum is 0. If so, abort.
        if ( ! this.tickRunning ) return;

        var xy = this.isVertical ? 'y' : 'x';

        var now = this.X.performance.now();
        var elapsed = now - this.lastTime;
        this.lastTime = now;

        // The distance covered in this amount of time.
        var distance = this.momentum * elapsed; // Fractional pixels.
        touch[xy] += distance;
        // Emit a touchMove for this.
        var delta, total, current;
        if ( this.isVertical ) { delta = touch.dy; total = touch.totalY; current = touch.y; }
        else { delta = touch.dx; total = touch.totalX; current = touch.x; }

        if ( delta != 0 )
          this.pingHandlers(this.direction + 'ScrollMove', delta, total, current);

        // Now we reduce the momentum to its new value.
        this.momentum *= this.dragCoefficient;

        // If this is less than the threshold, we reduce it to 0.
        if ( Math.abs(this.momentum) < this.dragClamp ) {
          this.momentum = 0;
          this.tickRunning = false;
          this.sendEndEvent(touch);
        } else {
          this.tick(touch);
        }
      }
    },
    {
      name: 'stopMomentum',
      documentation: 'Passed to scroll handlers. Can be used to stop momentum from continuing after scrolling has reached the edge of the target\'s scrollable area.',
      code: function() {
        this.momentum = 0;
        // Let tickRunning continue to be true, since tick() will send the end event properly,
        // now that the momentum has run out.
      }
    }
  ]
});

MODEL({
  name: 'VerticalScrollNativeTrait',
  documentation: 'Makes (part of) a View scroll vertically. Expects scrollerID to be a property, giving the DOM ID of the element with overflow:scroll or similar. Any onScroll listener will be called on each scroll event, as per the verticalScrollNative gesture. NB: this.onScroll should be a listener, because this trait does not bind it.',
  properties: [
    {
      name: 'scroller$',
      documentation: 'A convenience that returns the scroller\'s DOM element.',
      getter: function() { return this.X.$(this.scrollerID); }
    },
    {
      name: 'scrollGesture',
      documentation: 'The currently installed ScrollGesture.',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        if ( ! this.scrollerID ) {
          console.warn('VerticalScrollNativeTrait attached to View without a scrollerID property set.');
          return '';
        }
        return this.X.GestureTarget.create({
          containerID: this.scrollerID,
          handler: this,
          gesture: 'verticalScrollNative'
        });
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.X.gestureManager.install(this.scrollGesture);
    },
    destroy: function() {
      this.SUPER();
      this.X.gestureManager.uninstall(this.scrollGesture);
      if ( this.onScroll && this.scroller$ )
        this.scroller$.removeEventListener('scroll', this.onScroll)
    },
    attachScrollEvent: function() {
      /* Checks for this.onScroll. If found, will attach a scroll event listener for it. */
      if ( this.onScroll )
        this.scroller$.addEventListener('scroll', this.onScroll);
    }
  }
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
console.log("tap! rec");
      return Object.keys(map).every(function(key) {
        var p = map[key];
        return p.done && Math.abs(p.totalX) < 10 && Math.abs(p.totalY) < 10;
      });
    },

    attach: function(map, handlers) {
console.log("tap! attach");
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
      name: 'containerID',
      help: 'The containing DOM node\'s ID. Used for checking what inputs are within which gesture targets.'
    },
    {
      name: 'getElement',
      help: 'Function to retrieve the element this gesture is attached to. Defaults to $(containerID).',
      defaultValue: function() { return this.X.$(this.containerID); }
    },
    {
      name: 'handler',
      help: 'The target for the gesture\'s events, after it has been recognized.'
    }
  ]
});

MODEL({
  name: 'GestureManager',
  properties: [
    {
      name: 'gestures',
      factory: function() {
        return {
          verticalScroll: ScrollGesture.create(),
          verticalScrollMomentum: ScrollGesture.create({ momentumEnabled: true }),
          verticalScrollNative: ScrollGesture.create({ nativeScrolling: true }),
          horizontalScroll: ScrollGesture.create({ direction: 'horizontal' }),
          horizontalScrollMomentum: ScrollGesture.create({ direction: 'horizontal', momentumEnabled: true }),
          horizontalScrollNative: ScrollGesture.create({ direction: 'horizontal', nativeScrolling: true }),
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
      name: 'targetsByID',
      documentation: 'All gesture targets stored by the ID of their containing DOM element.',
      factory: function() { return {}; }
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
      if ( ! this.targetsByID[target.containerID] )
        this.targetsByID[target.containerID] = [];
      this.targetsByID[target.containerID].push(target);
    },
    uninstall: function(target) {
      this.targets.deleteI(target);
      if ( this.targetsByID[target.containerID] ) {
        this.targetsByID[target.containerID].deleteI(target);
        if ( this.targetsByID[target.containerID].length === 0 ) {
          delete this.targetsByID[target.containerID];
        }
      }
    },

    debug_tag: function() {
      this.targets.forEach(function(x) { x.seen = true; });
    },
    debug_sweep: function() {
      this.targets.forEach(function(x) { if ( x.seen ) { console.log(x); } });
    },

    // Only allows gestures that match the optional predicate.
    // If it is not set, any gesture will match.
    activateContainingGestures: function(x, y, opt_predicate) {
      // Start at the innermost element and work our way up,
      // checking against targetsByID. We go all the way up
      // to the document, since we want every relevant handler.
      var e = this.X.document.elementFromPoint(x, y);
      while ( e ) {
        if ( e.id && this.targetsByID[e.id] ) {
          var ts = this.targetsByID[e.id];
          for ( var i = 0 ; i < ts.length ; i++ ) {
            var t = ts[i];
            var g = this.gestures[t.gesture];
            if ( g && ( ! opt_predicate || opt_predicate(g) ) ) {
              if ( ! this.active[g.name] ) this.active[g.name] = [];
              this.active[g.name].push(t);
            }
          }
        }
        e = e.parentNode;
      }
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
      this.active = {};
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
          this.activateContainingGestures(touch.x, touch.y);
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
          this.activateContainingGestures(point.x, point.y);
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
        this.active = {};
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
          // TODO: May need to check or listen for the non-momentum versions too?
          var gesture = Math.abs(event.deltaX) > Math.abs(event.deltaY) ?
              'horizontalScrollMomentum' : 'verticalScrollMomentum';
          // Find all targets for that gesture and check their rectangles.
          this.activateContainingGestures(wheel.x, wheel.y,
              function(g) { return g.name === gesture; });

          // And since wheel events are already moving, include the deltas immediately.
          // We have to do this after checking containment above, or a downward (negative)
          // scroll too close to the top of the rectangle will fail.
          wheel.x -= event.deltaX;
          wheel.y -= event.deltaY;

          if ( this.active[gesture] && this.active[gesture].length ) {
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

