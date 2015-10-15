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
  name: 'PinchTwistGesture',
  package: 'foam.input.touch',
  extends: 'foam.input.touch.Gesture',
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
      if ( Object.keys(map).length !== 2 ) return this.NO;

      var points = this.getPoints(map);
      if ( points[0].done || points[1].done ) return this.NO;
      var moved = ( points[0].dx !== 0 || points[0].dy !== 0 ) &&
          ( points[1].dx !== 0 || points[1].dy !== 0 );
      return moved ? this.YES : this.MAYBE;
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
      Object_forEach(map, function(p) { p.shouldPreventDefault = true; });
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

