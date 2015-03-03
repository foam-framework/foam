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
  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.demos.physics.PhysicalCircle' ],

  properties: [
    { name: 'n',          defaultValue: 17 },
    { name: 'width',      defaultValue: 2000 },
    { name: 'height',     defaultValue: 1700 },
    { name: 'background', defaultValue: 'white' },
    { name: 'mouse',      factory: function() { return Mouse.create(); } }
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

          //  Movement.strut(mouse, c, (x-2)*20, (y-2)*20);
          Movement.spring(mouse, c, (x-(N-1)/2)*20, (y-(N-1)/2)*20);
          Movement.inertia(c);
          Movement.friction(c, 0.85);
        }
      }
    }
  }
});
