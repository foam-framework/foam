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

CLASS({
  name: 'ScrollGesture',
  package: 'foam.input.touch',
  extends: 'foam.input.touch.Gesture',
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

  constants: {
    // After moving this far in the scrolling direction, considered a scroll.
    DRAG_TOLERANCE: 10
  },

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

      if ( Object.keys(map).length !== 1 ) return this.NO;
      var point = map[Object.keys(map)[0]];

      if ( point.type === 'mouse' || point.done ) return this.NO;
      if ( Math.abs(this.momentum) > 0 ) return this.YES;
      var delta = Math.abs(this.isVertical ? point.totalY : point.totalX);
      return delta > this.DRAG_TOLERANCE ? this.YES : this.MAYBE;
    },

    attach: function(map, handlers) {
      var point = map[Object.keys(map)[0]];
      this.handlers = handlers || [];

      if ( this.nativeScrolling ) return;

      Object_forEach(map, function(p) { p.shouldPreventDefault = true; });

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

