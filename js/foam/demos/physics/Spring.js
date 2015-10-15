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
  name: 'Spring',
  extends: 'foam.graphics.CView',

  requires: [ 'foam.demos.physics.PhysicalCircle', 'foam.input.Mouse' ],

  properties: [
    [ 'n',          17 ],
    [ 'width',      1000 ],
    [ 'height',     1000 ],
    [ 'background', 'white' ],
    { name: 'mouse', lazyFactory: function() { return this.Mouse.create(); } }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      var N     = this.n;
      var mouse = this.mouse;

      mouse.connect(this.$);
      mouse.x = mouse.y = 220;

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 8,
            x: 220 + (x-(N-1)/2)*25,
            y: 220 + (y-(N-1)/2)*25,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          Movement.spring(mouse, c, (x-(N-1)/2)*20, (y-(N-1)/2)*20);
          Movement.inertia(c);
          Movement.friction(c, 0.94);
        }
      }
    }
  }
});
