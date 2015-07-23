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
  name: 'TouchManager',
  package: 'foam.input.touch',

  requires: [
    'foam.input.touch.InputPoint'
  ],

  properties: [
    { name: 'touches', factory: function() { return {}; } }
  ],

  constants: {
    TOUCH_START: ['touch-start'],
    TOUCH_END:   ['touch-end'],
    TOUCH_MOVE:  ['touch-move']
  },

  methods: {
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
      this.touches[i] = this.InputPoint.create({
        id: i,
        type: 'touch',
        x: t.pageX,
        y: t.pageY
      });
      this.publish(this.TOUCH_START, this.touches[i]);
    },
    touchMove: function(i, t, e) {
      var touch = this.touches[i];
      touch.x = t.pageX;
      touch.y = t.pageY;

      // On touchMoves only, set the lastTime.
      // This is used by momentum scrolling to find the speed at release.
      touch.lastTime = this.X.performance.now();

      if ( touch.shouldPreventDefault ) e.preventDefault();

      this.publish(this.TOUCH_MOVE, this.touch);
    },
    touchEnd: function(i, t, e) {
      var touch = this.touches[i];
      touch.x = t.pageX;
      touch.y = t.pageY;
      touch.done = true;
      this.publish(this.TOUCH_END, touch);
      if ( touch.shouldPreventDefault && e.cancelable ) e.preventDefault();
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
        if (!e._touchcount)
          e._touchcount = 0;
        e._touchcount++;
        // Attach an element-specific touch handlers, in case it gets removed
        // from the DOM. We only need to do this once, so do it when the first
        // touch starts on the object.
        if (e._touchcount == 1)
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
        e._touchcount--;
        // Don't detach handlers until all touches on the object have ended.
        if (e._touchcount == 0)
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

