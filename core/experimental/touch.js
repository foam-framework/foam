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
  name: 'FOAMTouch',
  properties: [
    'id', 'x', 'y'
  ],

  methods: {
    start: function(t) {
      this.x = t.screenX;
      this.y = t.screenY;
    },
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
  name: 'TouchManager',

  properties: [
    { name: 'touches', factory: function() { return {}; } }
  ],

  methods: {
    TOUCH_START: ['touch-start'],
    TOUCH_END: ['touch-end'],
    TOUCH_MOVE: ['touch-move'],

    install: function(d) {
      d.addEventListener('touchstart', this.onTouchStart);
      d.addEventListener('touchend', this.onTouchEnd);
      d.addEventListener('touchmove', this.onTouchMove);
      d.addEventListener('touchcancel', this.onTouchCancel);
      d.addEventListener('touchleave', this.onTouchLeave);
    },

    touchStart: function(i, t, e) {
      this.touches[i] = this.X.FOAMTouch.create({ id: i });
      this.touches[i].start(t);
      this.publish(this.TOUCH_START, this.touches[i]);
    },
    touchMove: function(i, t, e) {
      this.touches[i].move(t);
    },
    touchEnd: function(i, t, e) {
      this.touches[i].move(t);
      this.publish(this.TOUCH_END, this.touches[i]);
      delete this.touches[i];
    },
    touchCancel: function(i, t, e) {
      this.touches[i].cancel(e, t);
    },
    touchLeave: function(i, t, e) {
      this.touches[i].leave(e, t);
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(e) {
        e.preventDefault();
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          this.touchStart(i, t, e);
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
          this.touchMove(i, t, e);
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
          this.touchEnd(i, t, e);
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
          this.touchCancel(i, t, e);
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
          this.touchLeave(i, t, e);
        }
      }
    }
  ]
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
