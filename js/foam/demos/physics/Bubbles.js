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
  name: 'Bubbles',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.demos.physics.PhysicalCircle',
    'foam.physics.Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer' ],

  properties: [
    'timer',
    [ 'n',          7 ],
    [ 'width',      800 ],
    [ 'height',     600 ],
    [ 'background', '#ccf' ],
    { name: 'collider',   factory: function() {
      return this.Collider.create();
    }}
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      var N = this.n;

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 15,
            x: 400+(x-(N-1)/2)*70,
            y: 200+(y-(N-1)/2)*70,
            borderWidth: 6,
            color: 'white',
            border: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          c.y$.addListener(function(c) {
            if ( c.y > 1/this.scaleY*this.height+50 ) {
              c.y = -50;
            }
          }.bind(this, c));

          Movement.gravity(c, 0.03);
          Movement.inertia(c);
          Movement.friction(c, 0.96);
          this.bounceOnWalls(c, this.width, this.height);
          this.collider.add(c);
        }
      }

      var count = 0;
      this.timer.i$.addListener(function() {
        if ( this.timer.i % 10 ) return;
        if ( count++ == 100 ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        var b = this.PhysicalCircle.create({
          r: 3,
          x: this.width * Math.random(),
          y: this.height/this.scaleY,
          color: 'white',
          borderWidth: 1,
          border: 'blue',
          mass: 0.3
        });

        b.y$.addListener(function() {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }.bind(this, b));
        b.vy = -4;
        Movement.inertia(b);
        Movement.gravity(b, -0.2);
        Movement.friction(b);
        this.collider.add(b);

        this.addChild(b);
      }.bind(this));

      this.collider.start();
    },

    bounceOnWalls: function (c, w, h) {
      Events.dynamicFn(function() { c.x; c.y; }, function() {
        var r = c.r + c.borderWidth;
        if ( c.x < r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - r ) c.vx = -Math.abs(c.vx);
      });
    },

    destroy: function() {
      this.SUPER();
      this.collider.destroy();
    }
  }
});
