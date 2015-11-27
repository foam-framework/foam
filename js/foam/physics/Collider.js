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
CLASS({
  package: 'foam.physics',
  name: 'Collider',

  properties: [
    { name: 'children', factory: function() { return []; } }
  ],

  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function () {
        if ( this.stopped_ ) return;
        this.detectCollisions();
        this.tick();
      }
    }
  ],

  methods: [
    function start() {
      this.stopped_ = false;
      this.tick();
    },
    function stop() {
      this.stopped_ = true;
    },
    function updateChild(child) {
    },
    // TODO: this should be done much more efficiently (quad-tree, k-d tree, or similar).
    function detectCollisions() {
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        this.updateChild(c1);
        for ( var j = i+1 ; j < cs.length ; j++ ) {
          var c2 = cs[j];
          if ( c1.intersects(c2) ) this.collide(c1, c2);
        }
      }
    },
    /*
    function backup(c1, c2) {
      for ( var i = 0.01 ; ; i += 0.1 ) {
        var x1 = c1.x - c1.vx * i;
        var y1 = c1.y - c1.vy * i;
        var x2 = c2.x - c2.vx * i;
        var y2 = c2.y - c2.vy * i;

        if ( Movement.distance(x1-x2, y1-y2) > c1.r + c2.r || i >= 1 ) {
          c1.x = x1; c1.y = y1;
          c2.x = x2; c2.y = y2;
          return;
        }
      }
    },
    */
    function collide(c1, c2) {
      // this.backup(c1, c2);  // backup to the point of collision

      var a  = Math.atan2(c2.y-c1.y, c2.x-c1.x);
      var m1 =  c1.momentumAtAngle(a);
      var m2 = -c2.momentumAtAngle(a);
      var m  = 2 * ( m1 + m2 );

      // ensure a minimum amount of momentum to that objects don't overlap
      m = Math.max(1, m);
      var tMass = c1.mass + c2.mass;
      c1.applyMomentum(-m * c2.mass/tMass, a);
      c2.applyMomentum(m * c1.mass/tMass, a);
    },
    // add one or more components to be monitored for collisions
    function add() {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.children.push(arguments[i]);
      return this;
    },
    function findChildAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var cs = this.children;
      // Start from the end to find the child in the foreground
      for ( var i = cs.length-1 ; i >= 0 ; i-- ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) return c1;
      }
    },
    function selectChildrenAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var children = [];
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        if ( c1.intersects(c2) ) children.push(c1);
      }
      return children;
    },
    function remove() {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.children.deleteI(arguments[i]);
      return this;
    },
    function destroy() {
      this.stopped_ = true;
      this.children = [];
    }
  ]
});
