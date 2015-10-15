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
  name: 'Baloons',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.demos.physics.PhysicalCircle',
    'foam.input.Mouse',
    'foam.physics.Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer' ],

  properties: [
    'timer',
    [ 'n',          6 ],
    [ 'width',      1500 ],
    [ 'height',     1000 ],
    [ 'background', 'white' ],
    { name: 'mouse',    lazyFactory: function() { return this.Mouse.create(); } },
    { name: 'collider', factory: function() { return this.Collider.create(); } },
    { name: 'anchor',   factory: function() {
      return this.PhysicalCircle.create({r: 9, x: 1400, y: 400});
    }}
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      var N     = this.n;
      var mouse = this.mouse;

      mouse.connect(this.$);

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 25,
            x: 600+(x-(N-1)/2)*70,
            y: 400+(y-(N-1)/2)*70,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          Movement.spring(this.anchor, c, (x-(N-1)/2)*90-800, (y-(N-1)/2)*90, 6);
          Movement.inertia(c);
          Movement.friction(c, 0.98);
          this.timer.i$.addListener(function(c) {
            var d = Movement.distance(mouse.x - c.x, mouse.y - c.y);
            d = Math.max(0, (500-d) / 500);
            var r = 20 + 500 * d*d*d*d;
            c.r = c.r * 0.95 + r * 0.05;
          }.bind(this,c));
          this.collider.add(c);
        }
      }

      this.collider.start();
    },

    destroy: function() {
      this.SUPER();
      this.collider.destroy();
    }
  }
});
