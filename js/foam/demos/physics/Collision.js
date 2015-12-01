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
  name: 'Collision',
  extends: 'foam.ui.View',

  requires: [
    'foam.input.Mouse',
    'foam.graphics.CView',
    'foam.physics.Collider',
    'foam.demos.physics.PhysicalCircle'
  ],

  imports: [
    'dynamicFn'
  ],

  properties: [
    {
      name: 'space',
      factory: function() { return this.CView.create({ width: 1500, height: 800, background: 'white' }); }
    },
    {
      name: 'spaceView'
    },
    {
      name: 'mouse',
      factory: function() { return this.Mouse.create(); }
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    },
    {
      name: 'bumper',
      factory: function() { return this.PhysicalCircle.create({ r: 30, color: 'gray' }); }
    },
    {
      name: 'anchor',
      factory: function() { return this.PhysicalCircle.create({ r: 0, x: 1400, y: 400, color: 'white' }) }
    }
  ],

  methods: {
    toHTML: function() {
      this.spaceView = this.space.toView_();
      return this.spaceView.toHTML();
    },
    initHTML: function() {
      this.spaceView.initHTML();
      this.space.addChild(this.bumper);
      this.space.addChild(this.anchor);
      this.mouse.connect(this.space.$);

      var N = 7;
      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: x == (N-1)/2 ? 32 : x % 2 ? 25 : 10,
            x: 600+(x-(N-1)/2)*100,
            y: 400+(y-(N-1)/2)*100,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          c.mass = c.r;
          this.space.addChild(c);

          //    Movement.spring(anchor, c, (x-(N-1)/2)*90-800, (y-(N-1)/2)*90);
          Movement.inertia(c);
          Movement.friction(c, 0.99);
          this.bounceOnWalls(c, this.space.width, this.space.height);
          this.collider.add(c);
        }
      }

      var bumper = this.bumper;
      var oldCollide = this.Collider.getPrototype().collide;
      this.collider.collide = function(c1, c2) {
        if ( c2 === bumper ) {
          this.collide(c2, c1);
        } else if ( c1 === bumper ) {
          var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
          c2.vx += 20 * Math.cos(a);
          c2.vy += 20 * Math.sin(a);
        } else {
          oldCollide.call(this, c1, c2);
        }
      };

      Movement.strut(this.mouse, this.bumper, 0, 0);
      this.collider.add(this.bumper);
      this.collider.start();
    },
    bounceOnWalls: function(c, w, h) {
      this.dynamicFn(function() { c.x; c.y; }, function() {
        if ( c.x < c.r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
        if ( c.y < c.r ) c.vy = Math.abs(c.vy);
        if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
      });
    },
    shouldDestroy: function() { return false; },
    destroy: function() {
      this.SUPER();
      console.log('Collision destroy');
      this.collider.destroy();
    }
  }
});
