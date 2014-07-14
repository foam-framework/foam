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

    applyEnergy: function(e, a) {
      this.vx += e * Math.cos(a);
      this.vy += e * Math.sin(a);
    },
    velocityAtAngle: function(a) { return Math.cos(a-this.angleOfVelocity) * this.velocity; }, 
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
      var vx1 = c1.vx;
      var vy1 = c1.vy;
      var vx2 = c2.vx;
      var vy2 = c2.vy;

      var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);

      function forceRatio(c1, c2) {
        if ( c1.mass == c1.INFINITE_MASS ) return 0;
        if ( c2.mass == c2.INFINITE_MASS ) return 1;
        return c2.mass / ( c1.mass + c2.mass );
      }
      
      var e1 =  c1.velocityAtAngle(a);
      var e2 = -c2.velocityAtAngle(a);
      var e  = e1 + e2;

      if ( e > 0 ) {
        c1.applyEnergy(-e1 - forceRatio(c1, c2) * e, a);
        c2.applyEnergy( e2 + forceRatio(c2, c1) * e, a);
      }

      // If objects intersect, then move them away from each other
      var d = Movement.distance(c1.y-c2.y, c1.x-c2.x);
      var m = (d - (c1.r+c2.r) ) / 2;

      if ( c1.mass !== c1.INFINITE_MASS ) {
        c1.x += m * Math.cos(a);
        c1.y += m * Math.sin(a);
      }
      if ( c2.mass !== c1.INFINITE_MASS ) {
        c2.x += m * Math.cos(a+Math.PI);
        c2.y += m * Math.sin(a+Math.PI);
      }
    },
    add: function(c) { this.children.push(c); }
  }
});

