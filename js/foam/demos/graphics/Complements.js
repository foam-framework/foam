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
  name: 'Complements',

  extends: 'foam.graphics.CView',

  requires: [
    'foam.util.Timer',
    'foam.graphics.Circle'
  ],

  imports: [ 'timer' ],

  properties: [
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      name:  'r',
      defaultValue: 140,
      postSet: function(_, r) { this.width = this.height = 2*r + 100; }
    }
  ],

  methods: {
    initCView: function() {
      this.r = this.r;

      var self = this;
      var R = this.r;
      var D = this.width;
      var timer = this.timer;

      for ( var a = 0 ; a < 2*Math.PI ; a += 2*Math.PI/13 ) {
        var circle = this.Circle.create({
          x:     D/2 + R * Math.sin(a),
          y:     D/2 + R * Math.cos(a),
          color: 'hsl(' + 180*a/Math.PI + ', 90%, 60%)'
        });

        Events.dynamicFn((function (circle, a) {
          return function() {
            circle.r = 10 + 30 * Math.abs(Math.sin(a + timer.time/3000)); };
        })(circle, a));
        this.addChild(circle);
      }
      timer.start();
    }
  }
});
