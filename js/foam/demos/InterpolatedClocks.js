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
  package: 'foam.demos',
  name: 'InterpolatedClocks',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.demos.ClockView',
    'foam.graphics.Graph',
    'foam.input.Mouse',
    'foam.graphics.Label2'
  ],

  properties: [
    [ 'width',  3500 ],
    [ 'height', 2700 ],
    {
      name: 'mouse',
      transient: true,
      hidden: true,
      lazyFactory: function() {
        var m = this.Mouse.create();
        //m.connect(this.$);
        return m;
      }
    }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      var M = Movement;
      var is = [
        ['black',      M.easy, 'easy'],
        ['black',      M.spline(constantFn(0), M.linear), 'spline(constantFn(0), linear)'],
        ['black',      M.spline(M.linear, constantFn(1)), 'spline(linear, constantFn(1))'],
        ['black',      M.reverse(M.spline(M.linear, constantFn(1))), 'reverse(spline(linear, constantFn(1)))'],
        ['pink',       M.avg(M.easeIn(1.0),M.easeIn(1.0)), 'ease(0.25,0.25)'],
        ['red',        M.linear, 'linear'],
        ['green',      M.accelerate, 'accelerate'],
        ['brown',      M.avg(M.linear, M.accelerate), 'avg(linear, accelerate)'],
        ['blue',       M.easeIn(0.33), 'easeIn(0.33)'],
        ['blue',       M.easeIn(0.66), 'easeIn(0.66)'],
        ['blue',       M.easeIn(1.0), 'easeIn(1.0)'],
        ['darkBlue',   M.easeIn(1.0).o(M.easeIn(1.0)), 'easeIn(1.0).o(easeIn(1.0))'],
        ['yellow',     M.easeOut(0.25), 'easeOut(0.25)'],
        ['pink',       M.ease(0.25,0.25), 'ease(0.25,0.25)'],
        ['black',      M.avg(M.easeIn(0.25), M.easeOut(0.25)), 'avg(easeIn(0.25), easeOut(0.25))'],
        ['red',        M.bounce(0.15, 0.02, 1), 'bounce(0.15, 0.02,1)'],
        ['red',        M.bounce(0.15, 0.02, 2), 'bounce(0.15, 0.02, 2)'],
        ['red',        M.bounce(0.15, 0.02, 3), 'bounce(0.15, 0.02, 3)'],
        ['red',        M.reverse(M.bounce(0.15, 0.02, 3)), 'reverse(bounce(0.15, 0.02, 3))'],
        ['orange',     M.stepBack(0.05), 'stepBack(0.05)'],
        ['black',      M.bounce(0.5, 0.1, 3).o(M.stepBack(0.05)), 'bounce(0.5, 0.1, 3).o(stepBack(0.05))']
        /*
        ['orange',     M.back],
        ['purple',     M.back.o(M.back)],
        ['lightGreen', M.back.o(M.accelerate)]*/
      ];

      var clocks = [], graphs = [], ms = [];
      for ( var i = 0 ; i < is.length ; i++ ) {
        clocks[i] = this.ClockView.create({
          x: 640,
          y: 40+i*50,
          r: 20,
          color: is[i][0]
        });
        graphs[i] = this.Graph.create({
          x: 400,
          y: 20+i*50,
          width: 200,
          height: 45,
          style: 'Line',
          graphColor: null,
          lineWidth: 2,
          drawShadow: false,
          capColor: is[i][0],
          data: []
        });
        this.addChild(clocks[i]);
        this.addChild(this.Label2.create({
          font: '22px Arial',
          color: '#444',
          x: 10,
          y: 25+i*50,
          text: is[i][2]}));
        this.addChild(graphs[i]);
        (function (i) {
          var start = clocks[i].x;
          clocks[i].x$.addListener(function() {
            graphs[i].addData(clocks[i].x-start, 100);
          });

          ms[i] = Movement.animate(
            2000,
            function(x) {
              clocks[i].a = x/clocks[i].r;
              clocks[i].x = x;
            },
            is[i][1]);
        })(i);
      }

      this.$.onmousedown = function(evt) {
        for ( var i = 0 ; i < is.length ; i++ ) ms[i](evt.offsetX);
      };
    }
  }
});
