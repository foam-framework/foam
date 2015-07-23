/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name:  'Dragon',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.demos.graphics.EyesCView',
    'foam.graphics.Circle',
    'foam.util.Timer'
  ],
  imports: [ 'timer' ],

  constants: {
    COLOURS: ['#33f','#f00','#fc0','#33f','#3c0']
  },

  properties: [
    { name: 'i', defaultValue: 1 },
    { name: 'blowBubbles', defaultValue: true },
    {
      name:  'eyes',
      type:  'EyesCView',
      paint: true,
      factory: function() {
        return this.EyesCView.create({x:-45, y: -160, r: 25});
      }
    },
    { name:  'color', defaultValue: 'red' },
    {
      model_: 'IntProperty',
      name:  'r',
      label: 'Radius',
      defaultValue: 10
    },
    { name:  'width',  defaultValue: 1000 },
    { name:  'height', defaultValue: 800  },
    { name:  'x',      defaultValue: 500  },
    { name:  'y',      defaultValue: 350  },
    {
      name:  'backgroundColor',
      label: 'Background',
      type:  'String',
      defaultValue: 'gray'
    },
    { name:  'timer' }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      this.addChild(this.eyes);

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      this.timer.time$.addListener(function() {
        this.y = 350-30*Math.sin(Math.PI*2*this.timer.time/4000);
        this.view.resize = function() {};
        this.view.paint();
      }.bind(this));
    },

    dot: function(r) {
      var c = this.canvas;
      c.beginPath();
      c.fillStyle = this.COLOURS[this.i = (this.i + 1) % this.COLOURS.length];//'rgb(245,50,50)';
      c.arc(0,0,r,0,Math.PI*2,true);
      c.fill();
    },

    tail: function(r, a) {
      if ( r < 2 ) return;

      var c = this.canvas;
      this.dot(r);
      c.rotate(a);
      c.translate(0,r*2.2);
      this.tail(r*0.975, a);
    },

    wing: function(r, a) {
      if ( r < 1 ) return;

      var c = this.canvas;
      c.save();c.rotate(Math.PI/2);this.feather(r*0.4);c.restore();
      this.dot(r);
      c.rotate(a);
      c.translate(r*2.2,0);
      this.wing(r*0.945, a);
    },

    feather: function(r) {
      if ( r < 0.9 ) return;

      var c = this.canvas;
      this.dot(r);
      c.rotate(0.05 * Math.sin(Math.PI * this.timer.time/2000));
      c.translate(r*2.2,0);
      this.feather(r*0.92);
    },

    paintSelf: function() {
      var c = this.canvas;
      this.i = 0;

      var time = this.timer.time;

      c.save();
      try {
        // tail
        c.save();this.tail(this.r, Math.sin(time/4000*(Math.PI*2))*Math.PI/10);c.restore();

        var a = Math.sin(time/4000*(Math.PI*2))*Math.PI/31.5;
        // right wing
        c.save();c.rotate(-0.4);this.wing(this.r, a);c.restore();
        // left wing
        c.save();c.scale(-1,1);c.rotate(-0.4);this.wing(this.r, a);c.restore();

        // neck
        c.save();
        c.translate(0,2*-this.r);
        this.dot(this.r);
        c.translate(0,2*-this.r);
        this.dot(this.r*.8);
        c.restore();
      } catch(x) {
        console.log(x);
      }
      c.restore();

      if ( Math.random() > .2 ) return;

      var circle = this.Circle.create({
        r: 0,
        y: -this.r*6,
        color: 'white',
        borderWidth: 2,
        border: this.COLOURS[Math.floor(Math.random() * this.COLOURS.length)]});

      this.addChild(circle);

      if ( ! this.blowBubbles ) return;

      var M = Movement;

      M.compile([
        [
          [4000, function() {
            circle.x = circle.x - Math.random()*150 - 200;
            circle.alpha = 0;
           },
           Math.sqrt
          ],
          [4000, function() {
            circle.y = circle.y - 150 - Math.random() * 50;
            circle.r = 25 + Math.random() * 50;
            circle.borderWidth = 12;
           },
           M.easeIn(0.5)
          ]
        ],
        (function() { this.removeChild(circle); }).bind(this)
      ])();
    }
  }
});
