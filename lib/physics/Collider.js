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

Math.sign = function(n) { return n > 0 ? 1 : -1; };

MODEL({
  name: 'Physical',
  properties: [
    { model_: 'FloatProperty', name: 'vx',   defaultValue: 0 },
    { model_: 'FloatProperty', name: 'vy',   defaultValue: 0 },
    {
      model_: 'FloatProperty',
      name: 'velocity',
      getter: function() { return Movement.distance(this.vx, this.vy); },
      setter: function(v) { this.setVelocityAndAngle(v, this.angleOfVelocity); }
    },
    {
      model_: 'FloatProperty',
      name: 'angleOfVelocity',
      getter: function() { return Math.atan2(this.vy, this.vx); },
      setter: function(a) { this.setVelocityAndAngle(this.velocity, a); }
    },
    { model_: 'FloatProperty', name: 'mass', defaultValue: 1 }
  ],
  methods: {
    INFINITE_MASS: -1,

    applyMomentum: function(m, a) {
      this.vx += (m * Math.cos(a) / this.mass);
      this.vy += (m * Math.sin(a) / this.mass);
    },
    momentumAtAngle: function(a) {
      if ( this.mass == this.INFINITE_MASS ) return 0;
      var v = this.velocityAtAngle(a);
      return v * this.mass;
    },
    velocityAtAngle: function(a) {
      if ( this.mass == this.INFINITE_MASS ) return 0;
      return Math.cos(a-this.angleOfVelocity) * this.velocity;
    },
    setVelocityAndAngle: function(v, a) {
      this.vx = v * Math.cos(a);
      this.vy = v * Math.sin(a);
    }
  }
});


/** Collision detection manager. **/
MODEL({
  name: 'Collider',
  properties: [
    { name: 'children', factory: function() { return []; } }
  ],
  listeners: [
    {
      name: 'tick',
      code: function () {
        this.detectCollisions();
        this.start();
      }
    }
  ],
  methods: {
    start: function() {
      this.X.requestAnimationFrame(this.tick);
    },
    // TODO: this should be done much more efficiently (quad-tree, k-d tree, or similar).
    detectCollisions: function() {
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        for ( var j = i+1 ; j < cs.length ; j++ ) {
          var c2 = cs[j];
          var dx = c1.x - c2.x;
          if ( dx > 70 || dx < -70 ) continue;
          var dy = c1.y - c2.y;
          if ( dy > 70 || dy < -70 ) continue;

          var ds = dx*dx + dy*dy;
          var rs = c1.r + c2.r;
          if ( ds < rs*rs ) this.collide(c1, c2);
        }
      }
    },
    collide: function(c1, c2) {
      var a  = Math.atan2(c2.y-c1.y, c2.x-c1.x);
      var m1 = c1.momentumAtAngle(a);
      var m2 = c2.momentumAtAngle(a);
      var m  = m1 - m2;

      // ensure a minimum amount of momentum to that objects don't overlap
      m = Math.max(0.05, m);

      c1.applyMomentum( -m, a);
      c2.applyMomentum(  m, a);
    },

    // add one or more components to be monitored for collisions
    add: function() {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.children.push(arguments[i]);
    }
  }
});

