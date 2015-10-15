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
  name: 'TapGesture',
  package: 'foam.input.touch',
  extends: 'foam.input.touch.Gesture',
  help: 'Gesture that understands a quick, possible multi-point tap. Calls into the handler: tapClick(numberOfPoints).',

  properties: [
    {
      name: 'name',
      defaultValue: 'tap'
    },
    'handlers'
  ],

  constants: {
    // The maximum movement in either dimension to turn a touch into a drag.
    DRAG_TOLERANCE: 40
  },

  methods: {
    recognize: function(map) {
      // I recognize:
      // - multiple points that
      // - are all done and
      // - none of which has moved more than DRAG_TOLERANCE in some direction.
      var response;
      var doneCount = 0;
      var self = this;
      var keys = Object.keys(map);
      for ( var i = 0 ; i < keys.length ; i++ ) {
        var key = keys[i];
        var p = map[key];
        if ( Math.abs(p.totalX) >= this.DRAG_TOLERANCE ||
            Math.abs(p.totalY) >= this.DRAG_TOLERANCE ) {
          return this.NO;
        }
        if ( p.done ) doneCount++;
      }
      if ( response === this.NO ) return response;
      return doneCount === keys.length ? this.YES : this.WAIT;
    },

    attach: function(map, handlers) {
      // Nothing to listen for; the tap has already fired when this recognizes.
      // Just sent the tapClick(pointMap) message to the handlers.
      if  ( ! handlers || ! handlers.length ) return;
      var points = 0;
      Object_forEach(map, function(point) {
        points++;
        point.shouldPreventDefault = true;
      });
      handlers.forEach(function(h) {
        h && h.tapClick && h.tapClick(map);
      });
    }
  }
});
