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
  name: 'FadingCircles',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.input.Mouse',
    'foam.graphics.Circle'
  ],

  constants: {
    COLOURS: ['#33f','#f00','#fc0','#33f', '#cf0' ]
  },

  properties: [
    { name: 'width',      defaultValue: 2000 },
    { name: 'height',     defaultValue: 1700 },
    { name: 'background', defaultValue: 'black' },
    { name: 'mouse',      lazyFactory: function() { return this.Mouse.create(); } }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      this.background = 'black';
      var self    = this;
      var COLOURS = this.COLOURS;
      var mouse   = this.mouse;
      mouse.connect(this.$);

      Events.dynamicFn(function() { mouse.x; mouse.y; }, function() {
        var circle = this.Circle.create({
          x: mouse.x,
          y: mouse.y,
          r: 0,
          color: 'white',
          borderWidth: 3,
          border: COLOURS[(mouse.x+mouse.y)%COLOURS.length]});

        this.addChild(circle);

        Movement.animate(
          4000,
          function() { circle.r = 100; circle.alpha = 0; },
          Math.sqrt,
          function() { self.removeChild(circle); })();
      }.bind(this));
    }
  }
});
