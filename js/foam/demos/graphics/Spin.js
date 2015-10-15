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

// Inspired by: https://jsfiddle.net/gg19b2do/4/
CLASS({
  package: 'foam.demos.graphics',
  name: 'Spin',
  extends: 'foam.graphics.CView',

  requires: [ 'foam.util.Timer', 'foam.graphics.Arc' ],

  properties: [
    [ 'width', 500 ],
    [ 'height', 500 ],
    { name: 'timer',  factory: function() { return this.Timer.create(); } }
  ],

  methods: [
    function addArc(a, arc) {
      this.timer.time$.addListener(function(_, __, ___, time) {
//        arc.startAngle += Math.cos(time / 4000) * (a+1)/70;
        arc.startAngle += Math.cos(time / 5500) * (a+1)/100;
        arc.endAngle    = arc.startAngle + Math.PI;
      });
      this.addChild(arc);
    },
    function initCView() {
      for ( var a = 0 ; a < 20 ; a++ ) this.addArc(a, this.Arc.create({
        x: this.width / 2, y: this.height / 2, r: 5+a * 12 * this.width / 500, arcWidth: 10 * this.width / 500,
        color: 'hsl(' + 18*a + ', 90%, 60%)'
      }));

      this.timer.start();
    }
  ]
});
