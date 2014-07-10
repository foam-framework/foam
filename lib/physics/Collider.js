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
      // console.log('tick: ', this.children.length);
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        for ( var j = i+1 ; j < cs.length ; j++ ) {
          var c2 = cs[j];
          var dx = c1.x - c2.x;
          //            console.log('dx: ', dx);
          if ( dx > 70 || dx < -70 ) continue;
          var dy = c1.y - c2.y;
          //            console.log('dy: ', dy);
          if ( dy > 70 || dy < -70 ) continue;

          var ds = dx*dx + dy*dy;
          var rs = c1.r + c2.r;
//          if ( i == 0 ) console.log(c1.x, c1.y, c2.x, c2.y, ds, rs*rs);
          if ( ds < rs*rs ) this.collide(c1, c2);
        }
      }
    },
    collide: function(c1, c2) {
      var a = Math.atan(c1.y-c2.y, c1.x-c2.x);
      var d = Movement.distance(c1.y-c2.y, c1.x-c2.x);
      var m = (d - (c1.r+c2.r) ) / 2;
      c1.x += m * Math.cos(-a);
      c1.y += m * Math.sin(-a);
      c2.x += m * Math.cos(a);
      c2.y += m * Math.sin(a);

      var vx1 = c1.vx;
      var vy1 = c1.vy;
      var vx2 = c2.vx;
      var vy2 = c2.vy;

      c2.vx += c1.vx/2;
      c1.vx /= 2;
      c2.vy += c1.vy/2;
      c1.vy /= 2;

      c1.vx += c2.vx/2;
      c2.vx /= 2;
      c1.vy += c2.vy/2;
      c2.vy /= 2;
    },
    add: function(c) { this.children.push(c); }
  }
});

