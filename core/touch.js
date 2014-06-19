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
    'id', 'startX', 'startY', 'x', 'y',
    {
      name: 'dx',
      getter: function() {
        return this.x - this.startX;
      }
    },
    {
      name: 'dy',
      getter: function() {
        return this.y - this.startY;
      }
    },
    {
      name: 'distance',
      getter: function() {
        var dx = this.dx;
        var dy = this.dy;
        return Math.sqrt(dx*dx + dy*dy);
      }
    }
  ],

  methods: {
    cancel: function(e) {
      // TODO:
    },
    leave: function(e) {
      // TODO:
    },
    move: function(t) {
      this.x = t.clientX;
      this.y = t.clientY;
    }
  }
});

FOAModel({
  name: 'TouchReceiver',
  properties: [
    'id',
    'element',
    'delegate',
    { name: 'activeTouches', factory: function() { return {}; } }
  ]
});

FOAModel({
  name: 'TouchManager',

  properties: [
    { name: 'touches', factory: function() { return {}; } },
    { name: 'receivers', factory: function() { return []; } },
    { name: 'attached', defautValue: false, model_: 'BooleanProperty' }
  ],

  methods: {
    TOUCH_START: 'touch-start',
    TOUCH_END: 'touch-end',

    attachHandlers: function() {
      this.X.window.document.addEventListener('touchstart', this.onTouchStart);
      this.attached = true;
    },

    install: function(recv) {
      if ( ! this.attached ) this.attachHandlers();

      this.receivers.push(recv);

      // Attach a touchstart handler to the capture phase, this checks
      // whether each touch is inside the given element, and records the
      // offset into that element.
      recv.element.addEventListener('touchstart', this.touchCapture.bind(recv),
          true);
    },

    // NB: 'this' is bound to the receiver, not the TouchManager!
    touchCapture: function(event) {
      for ( var i = 0; i < event.changedTouches.length; i++ ) {
        var t = event.changedTouches[i];
        // TODO: Maybe capture the offset into the element here?
        this.activeTouches[t.identifier] = true;
      }
    },

    notifyReceivers: function(type, event) {
      var changed = [];
      for ( var i = 0 ; i < event.changedTouches.length ; i++ ) {
        changed.push(event.changedTouches[i].identifier);
      }

      var rets = [];
      for ( i = 0 ; i < this.receivers.length; i++ ) {
        var matched = false;
        for ( var j = 0 ; j < changed.length; j++ ) {
          if ( this.receivers[i].activeTouches[changed[j]] ) {
            matched = true;
            break;
          }
        }

        // Skip if this receiver isn't watching any of the changed touches.
        if ( ! matched ) continue;

        // Since it is watching, let's notify it of the change.
        var d = this.receivers[i].delegate;
        var f = d[type].bind(d);
        if ( f ) rets.push(f(this.touches, changed));
      }

      // Now rets contains the responses from the listeners.
      // Any that set drop: true should have their active touches cleared.
      // Then any that set claim: true have their weights compared.
      // The highest is the winner and all others are dropped.
      // If none set claim, then preventDefault if any non-dropped ones set it.
      // If we did have a winner, then preventDefault based on its wishes.
      var winner = -1;
      for ( i = 0 ; i < rets.length ; i++ ) {
        var r = rets[i];
        if ( r.drop ) {
          this.receivers[i].activeTouches = {};
          continue;
        }

        if ( r.claim && ( winner < 0 || r.weight > rets[winner].weight ) ) {
          winner = i;
        }
      }

      if ( winner >= 0 ) {
        for ( i = 0 ; i < rets.length ; i++ ) {
          if ( i != winner ) this.receivers[i].activeTouches = {};
        }
        if ( rets[winner].preventDefault ) event.preventDefault();
      } else {
        for ( i = 0 ; i < rets.length ; i++ ) {
          if ( ! rets[i].drop && rets[i].preventDefault ) {
            event.preventDefault();
            break;
          }
        }
      }
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( this.touches[t.identifier] ) {
            console.warn('Touch start for known touch.');
            continue;
          }
          console.log(t);
          this.touches[t.identifier] = FOAMTouch.create({
            id: t.identifier,
            startX: t.clientX,
            startY: t.clientY,
            x: t.clientX,
            y: t.clientY
          });
        }

        e.target.addEventListener('touchmove', this.onTouchMove);
        e.target.addEventListener('touchend', this.onTouchEnd);
        e.target.addEventListener('touchcancel', this.onTouchCancel);
        e.target.addEventListener('touchleave', this.onTouchLeave);

        this.notifyReceivers('onTouchStart', e);
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[t.identifier] ) {
            console.warn('Touch move for unknown touch.');
            continue;
          }
          this.touches[t.identifier].move(t);
        }
        this.notifyReceivers('onTouchMove', e);
      }
    },
    {
      name: 'onTouchEnd',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[t.identifier] ) {
            console.warn('Touch end for unknown touch.');
            continue;
          }
          this.touches[t.identifier].move(t);
        }
        this.notifyReceivers('onTouchEnd', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    },
    {
      name: 'onTouchCancel',
      code: function(e) {
        this.notifyReceivers('onTouchCancel', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    },
    {
      name: 'onTouchLeave',
      code: function(e) {
        this.notifyReceivers('onTouchLeave', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    }
  ]
});
