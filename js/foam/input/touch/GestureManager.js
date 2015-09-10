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
  name: 'GestureManager',
  package: 'foam.input.touch',
  requires: [
    'foam.input.touch.DragGesture',
    'foam.input.touch.Gesture',
    'foam.input.touch.GestureTarget',
    'foam.input.touch.PinchTwistGesture',
    'foam.input.touch.ScrollGesture',
    'foam.input.touch.TapGesture',
    'foam.input.touch.InputPoint'
  ],
  imports: [
    'document',
    'touchManager'
  ],
  properties: [
    {
      name: 'gestures',
      factory: function() {
        return {
          verticalScroll: this.ScrollGesture.create(),
          verticalScrollMomentum: this.ScrollGesture.create({ momentumEnabled: true }),
          verticalScrollNative: this.ScrollGesture.create({ nativeScrolling: true }),
          horizontalScroll: this.ScrollGesture.create({ direction: 'horizontal' }),
          horizontalScrollMomentum: this.ScrollGesture.create({ direction: 'horizontal', momentumEnabled: true }),
          horizontalScrollNative: this.ScrollGesture.create({ direction: 'horizontal', nativeScrolling: true }),
          tap: this.TapGesture.create(),
          drag: this.DragGesture.create(),
          pinchTwist: this.PinchTwistGesture.create()
        };
      }
    },
    {
      name: 'targets',
      documentation: 'Map of gesture targets, indexed by the ID of their containing DOM element.',
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
      this.touchManager.subscribe(this.touchManager.TOUCH_START, this.onTouchStart);
      this.touchManager.subscribe(this.touchManager.TOUCH_MOVE,  this.onTouchMove);
      this.touchManager.subscribe(this.touchManager.TOUCH_END,   this.onTouchEnd);
      this.document.addEventListener('mousedown', this.onMouseDown);
      this.document.addEventListener('mousemove', this.onMouseMove);
      this.document.addEventListener('mouseup', this.onMouseUp);
      this.document.addEventListener('wheel', this.onWheel);
      this.document.addEventListener('contextmenu', this.onContextMenu);
    },

    install: function(target) {
      if ( target.containerID ) {
        if ( ! this.targets[target.containerID] )
          this.targets[target.containerID] = [];
        this.targets[target.containerID].push(target);
      } else console.warn('no container ID on touch target');
    },
    uninstall: function(target) {
      var arr = this.targets[target.containerID];
      if ( ! arr ) return;
      for ( var i = 0 ; i < arr.length ; i++ ) {
        if ( arr[i] === target ) {
          arr.splice(i, 1);
          break;
        }
      }
      if ( arr.length === 0 )
        delete this.targets[target.containerID];
    },

    purge: function() {
      // Run through the targets DAO looking for any that don't exist on the DOM.
      var keys = Object.keys(this.targets);
      var count = 0;
      for ( var i = 0 ; i < keys.length ; i++ ) {
        if ( ! this.document.getElementById(keys[i]) ) {
          delete this.targets[keys[i]];
          count++;
        }
      }
      console.log('Purged ' + count + ' targets');
      return count;
    },

    // Only allows gestures that match the optional predicate.
    // If it is not set, any gesture will match.
    activateContainingGestures: function(x, y, opt_predicate) {
      // Start at the innermost element and work our way up,
      // checking against targets. We go all the way up
      // to the document, since we want every relevant handler.
      var e = this.X.document.elementFromPoint(x, y);
      while ( e ) {
        if ( e.id ) {
          var matches = this.targets[e.id];
          if ( matches && matches.length ) {
            for ( var i = 0 ; i < matches.length ; i++ ) {
              var t = matches[i];
              var g = this.gestures[t.gesture];
              if ( g && ( ! opt_predicate || opt_predicate(g) ) ) {
                if ( ! this.active[g.name] ) this.active[g.name] = [];
                this.active[g.name].push(t);
              }
            }
          }
        }
        e = e.parentNode;
      }
    },

    checkRecognition: function() {
      if ( this.recognized ) return;
      var self = this;
      var matches = [];
      // TODO: Handle multiple matching gestures.
      Object.keys(this.active).forEach(function(name) {
        var answer = self.gestures[name].recognize(self.points);
        if ( answer >= self.Gesture.WAIT ) {
          matches.push([name, answer]);
        } else {
          delete self.active[name];
        }
      });

      if ( matches.length === 0 ) return;

      // There are four possibilities here:
      // - If one or more gestures returned YES, the last one wins. The "last"
      //   part is arbitrary, but that's how this code worked previously.
      // - If a single gesture returned MAYBE, it becomes the only match.
      // - If a one or more  gesture returned WAIT, and none returned YES or
      //   MAYBE then there's no recognition yet, and we do nothing until one
      //   recognizes.
      // - If more than one gesture returned MAYBE, and none returned YES, then
      //   there's no recognition yet, and we do nothing until one recognizes.
      var i, lastYes = -1;
      for ( i = 0 ; i < matches.length ; i++ ) {
        if ( matches[i][1] === this.Gesture.YES ) lastYes = i;
      }
      var lastMaybe = -1;
      for ( i = 0 ; i < matches.length ; i++ ) {
        if ( matches[i][1] === this.Gesture.MAYBE ) lastMaybe = i;
      }

      // If there were no YES answers, then all the matches are MAYBEs.
      // If there is a WAIT or more than one WAIT/MAYBE, return. Otherwise, we
      // have our winner.
      var match;
      if ( lastYes < 0 ) {
        // If we have more than one WAIT/MAYBE, or
        // we have no MAYBEs, then there is no winner yet.
        if ( matches.length > 1 || lastMaybe < 0 ) return;

        match = matches[lastMaybe][0];
      } else {
        match = matches[lastYes][0];
      }

      // Filter out handlers that demand gesture points be inside the container.
      var matched = this.active[match].filter(function(m) {
        if ( ! m.enforceContainment ) return true;
        var r = m.getElement().getBoundingClientRect();
        var keys = Object.keys(self.points);
        for ( var i = 0; i < keys.length; ++i ) {
          var p = self.points[keys[i]];
          if ( p.x < r.left || p.x > r.right ||
              p.y < r.top || p.y > r.bottom ) return false;
        }
        return true;
      });

      // Filter all the handlers to make sure none is a child of any already existing.
      // This prevents eg. two tap handlers firing when the tap is on an inner one.
      var legal = [];
      for ( i = 0 ; i < matched.length ; i++ ) {
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

      // legal.length may be 0 if all targets enforce containment and current x
      // or y is no longer inside targets. In this case, do not bother attaching
      // the empty list of handlers.
      if ( legal.length > 0 ) this.gestures[match].attach(this.points, legal);
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
        var point = this.InputPoint.create({
          id: 'mouse',
          type: 'mouse',
          x: event.clientX,
          y: event.clientY
        });

        // TODO: De-dupe me with the code above in onTouchStart.
        if ( this.recognized ) {
          this.recognized.addPoint && this.recognized.addPoint(point);
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
        this.points.mouse.x = event.clientX;
        this.points.mouse.y = event.clientY;
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
        this.points.mouse.x = event.clientX;
        this.points.mouse.y = event.clientY;
        this.points.mouse.done = true;
        if ( ! this.recognized ) {
          this.checkRecognition();
        }

        delete this.points.mouse;
        this.active = {};
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
          var wheel = this.InputPoint.create({
            id: 'wheel',
            type: 'wheel',
            x: event.clientX,
            y: event.clientY
          });

          // Now immediately feed this to the appropriate ScrollGesture.
          // We hit all three of vanilla, momentum, and native.
          var dir = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'horizontal' : 'vertical';
          var gestures = [dir + 'Scroll', dir + 'ScrollMomentum', dir + 'ScrollNative'];
          // Find all targets for that gesture and check their rectangles.
          this.activateContainingGestures(wheel.x, wheel.y,
              function(g) { return gestures.indexOf(g.name) >= 0; });

          // And since wheel events are already moving, include the deltas immediately.
          // We have to do this after checking containment above, or a downward (negative)
          // scroll too close to the top of the rectangle will fail.
          wheel.x -= event.deltaX;
          wheel.y -= event.deltaY;

          for ( var i = 0 ; i < gestures.length ; i++ ) {
            var gesture = gestures[i];
            if ( this.active[gesture] && this.active[gesture].length ) {
              if ( ! this.points.wheel ) this.points.wheel = wheel;
              this.gestures[gesture].attach(this.points, this.active[gesture].map(function(gt) {
                return gt.handler;
              }));
              this.recognized = this.gestures[gesture];
              this.wheelTimer = this.X.window.setTimeout(this.onWheelDone,
                  this.scrollWheelTimeout);
              break;
            }
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
