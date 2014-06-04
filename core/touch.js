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

FOAModel({
  name: 'FOAMTouch',
  properties: [
    'id', 'x', 'y'
  ],

  methods: {
    cancel: function(e) {
      // TODO:
    },
    leave: function(e) {
      // TODO:
    },
    move: function(t) {
      this.x = t.screenX;
      this.y = t.screenY;
    }
  }
});

FOAModel({
  name: 'TouchManager',

  properties: [
    { name: 'touches', factory: function() { return {}; } }
  ],

  methods: {
    TOUCH_START: 'touch-start',
    TOUCH_END: 'touch-end',
    TOUCH_MOVE: 'touch-move',

    install: function(d) {
      d.addEventListener('touchstart', this.onTouchStart);
      d.addEventListener('touchend', this.onTouchEnd);
      d.addEventListener('touchmove', this.onTouchMove);
      d.addEventListener('touchcancel', this.onTouchCancel);
      d.addEventListener('touchleave', this.onTouchLeave);
    },

    touchStart: function(i, t) {
      this.touches[i] = FOAMTouch.create({
        id: i,
        x: t.screenX,
        y: t.screenY
      });
      this.publish(this.TOUCH_START, this.touches[i]);
    },
    touchMove: function(i, t) {
      this.touches[i].move(t);
    },
    touchEnd: function(i, t) {
      this.touches[i].move(t);
      this.publish(this.TOUCH_END, this.touches[i]);
      delete this.touches[i];
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( this.touches[i] ) {
            console.warn('Touch start for known touch.');
            continue;
          }
          this.touchStart(i, t);
        }
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
        e.preventDefault();

        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[i] ) {
            console.warn('Touch move for unknown touch.');
            continue;
          }
          this.touchMove(i, t);
        }
      }
    },
    {
      name: 'onTouchEnd',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[i] ) {
            console.warn('Touch end for unknown touch.');
            continue;
          }
          this.touchEnd(i, t);
        }
      }
    },
    {
      name: 'onTouchCancel',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[i] ) {
            console.warn('Touch cancel for unknown touch.');
            continue;
          }

          this.touches[i].cancel(e, t);
        }
      }
    },
    {
      name: 'onTouchLeave',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[i] ) {
            console.warn('Touch cancel for unknown touch.');
            continue;
          }

          this.touches[i].leave(e, t);
        }
      }
    }
  ]
});
