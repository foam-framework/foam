/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.demos.physics',
  name: 'CollisionWithSpring',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.physics.Collider',
    'foam.demos.physics.PhysicalCircle',
    'foam.input.Mouse'
  ],

  properties: [
    [ 'n',          7 ],
    [ 'width',      1500 ],
    [ 'height',     1000 ],
    [ 'background', 'white' ],
    { name: 'mouse',      lazyFactory: function() { return this.Mouse.create(); } },
    { name: 'collider',   factory: function() {
      return this.Collider.create();
    }},
    { name: 'bumper',     factory: function() {
      return this.PhysicalCircle.create({r: 30, color: 'gray'});
    }},
    { name: 'anchor',     factory: function() {
      return this.PhysicalCircle.create({r: 9, x: 1400, y: 400});
    }}
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      this.addChild(this.bumper);

      var N = this.n;

      this.mouse.connect(this.$);

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 25,
            x: 600+(x-(N-1)/2)*70,
            y: 400+(y-(N-1)/2)*70,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          Movement.spring(this.anchor, c, (x-(N-1)/2)*90-800, (y-(N-1)/2)*90);
          Movement.inertia(c);
          Movement.friction(c, 0.98);
          this.bounceOnWalls(c, this.width, this.height);
          this.collider.add(c);
        }
      }

      var bumper = this.bumper;
      this.collider.collide = function(c1, c2) {
        if ( c2 === bumper ) {
          this.collide(c2, c1);
        } else if ( c1 === bumper ) {
          var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
          c2.vx += 25 * Math.cos(a);
          c2.vy += 25 * Math.sin(a);
        } else {
          foam.physics.Collider.getPrototype().collide.call(this, c1, c2);
        }
      };

      Movement.strut(this.mouse, bumper, 0, 0);
      this.collider.add(bumper);
      this.collider.start();
    },

    bounceOnWalls: function (c, w, h) {
      Events.dynamicFn(function() { c.x; c.y; }, function() {
        if ( c.x < c.r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
        if ( c.y < c.r ) c.vy = Math.abs(c.vy);
        if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
      });
    },

    destroy: function() {
      this.SUPER();
      this.collider.destroy();
    }
  }
});
