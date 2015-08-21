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
  package: 'foam.demos.graphics',
  name: 'Complements2a',

  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.util.Timer',
    'foam.graphics.Circle'
  ],

  imports: [ 'timer' ],

  properties: [
    { name: 'width', defaultValue: 1000 },
    { name: 'height', defaultValue: 1000 },
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    { name: 'background', defaultValue: 'pink' },
    {
      name:  'r',
      defaultValue: 300,
      postSet: function(_, r) { this.width = this.height = 2*r + 100; }
    }
  ],

  methods: [
    function initCView() {
      this.r = this.r;

      var self = this;
      var R = this.r;
      var D = this.width;
      var timer = this.timer;

      for ( var a = 0 ; a < 2*Math.PI ; a += 2*Math.PI/40 ) {
        var circle = this.Circle.create({
          color: 'white',
          borderWidth: 4,
          border: 'hsl(' + 180*a/Math.PI + ', 90%, 60%)'
        });

        Events.dynamic((function (circle, a) {
          return function() {
            var a2 = timer.time / 15000 * 2 * Math.PI;
            var r2 = R * Math.cos(2*(a + a2 + Math.PI/2));
            circle.r = 20 + 40 * Math.abs(Math.pow(Math.sin(2*(a + a2*1.5 + Math.PI/4)),4));
            circle.x = 20 + D/2 + r2 * Math.sin(a);
            circle.y = 20 + D/2 + r2 * Math.cos(a);
          };
        })(circle, a));
        this.addChild(circle);
      }
      timer.start();
    }
  ]
});
