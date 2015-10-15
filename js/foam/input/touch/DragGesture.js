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
  name: 'DragGesture',
  package: 'foam.input.touch',
  extends: 'foam.input.touch.Gesture',
  help: 'Gesture that understands a hold and drag with mouse or one touch point.',
  properties: [
    {
      name: 'name',
      defaultValue: 'drag'
    }
  ],

  constants: {
    // After dragging this far in any one dimension, consider the gesture
    // definitely a drag.
    DRAG_TOLERANCE: 20
  },

  methods: {
    recognize: function(map) {
      // I recognize:
      // - a single point that
      // - is not done and
      // - has begun to move
      // I conflict with: vertical and horizontal scrolling, when using touch.
      var keys = Object.keys(map);
      if ( keys.length > 1 ) return this.NO;
      var point = map[keys[0]];
      if ( point.done ) return this.NO;
      var delta = Math.max(Math.abs(point.totalX), Math.abs(point.totalY));
      var r = delta >= this.DRAG_TOLERANCE ? this.YES : this.MAYBE;
      // Need to preventDefault on touchmoves or Chrome can swipe for
      // back/forward.
      if ( r != this.NO ) point.shouldPreventDefault = true;
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

