/*
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

var Dragon = Model.create({

  extendsModel: 'PanelCView',

  name:  'Dragon',

  properties: [
    {
      name:  'eyes',
      type:  'EyesCView',
      paint: true,
      valueFactory: function() {
        return EyesCView.create({x:500,y:500,r:this.r*10,parent:this});
      }
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'red'
    },
    {
      name:  'r',
      label: 'Radius',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 200
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 200
    },
    {
      name:  'backgroundColor',
      label: 'Background',
      type:  'String',
      defaultValue: 'gray'
    },
    {
      name:  'timer'
    }
  ],

  methods: {
    colours: ['#33f','#f00','#fc0','#33f','#3c0'],

    dot: function(r) {
      var c = this.canvas;
      c.beginPath();
      c.fillStyle = this.colours[this.i = (this.i + 1) % this.colours.length];//'rgb(245,50,50)';
      c.arc(0,0,r,0,Math.PI*2,true);
      c.fill();
    },

    tail: function(r) {
      if ( r < 1 ) return;

      var c = this.canvas;
      this.dot(r);
      c.rotate(Math.sin(this.timer.time/2000*(Math.PI*2))*Math.PI/10);
      c.translate(0,r*2.2);
      this.tail(r*0.975);
    },

    wing: function(r) {
      if ( r < 1 ) return;

      var c = this.canvas;
      c.save();c.rotate(Math.PI/2);this.feather(r*0.4);c.restore();
      this.dot(r);
      c.rotate(Math.sin(this.timer.time/2000*(Math.PI*2))*Math.PI/31.5);
      c.translate(r*2.2,0);
      this.wing(r*0.945);
    },

    feather: function(r) {
      if ( r < 1.9 ) return;

      var c = this.canvas;
      this.dot(r);
      c.rotate(0.05 * Math.sin(this.timer.time/2000*(Math.PI*2)));
      c.translate(r*2.2,0);
      this.feather(r*0.92);
    },

    init: function() {
      this.__super__.init.apply(this, arguments);
      var me = this;
      this.i = 0;
      Events.dynamic(function() { timer.time; }, function() { me.paint(); });
//      this.timer && this.timer.propertyValue('time').addListener(this.paint.bind(this));
    },

    paint: function() {
      if ( ! this.canvasView ) return;
      this.canvasView.erase();
      this.__super__.paint.call(this);

      var c = this.canvas;
      c.save();
      this.i = 0;
      try
      {

      c.translate(500,250);
      c.translate(0, -30*Math.sin(this.timer.time/2000*(Math.PI*2)));

      // tail
      c.save();this.tail(this.r);c.restore();

      // right wing
      c.save();c.rotate(-0.4);this.wing(this.r);c.restore();

      // left wing
      c.save();c.scale(-1,1);c.rotate(-0.4);this.wing(this.r);c.restore();

      // neck
      c.translate(0,2*-this.r);
      this.dot(this.r);
      c.translate(0,2*-this.r);
      this.dot(this.r*.8);

      // eyes
      c.scale(0.38, 0.38);
      c.translate(-80,-140);
      c.translate(-500,-500);
      this.eyes.paint();

      }
      catch(x) {
        console.log(x);
      }
      c.restore();

      if ( Math.random() > 0.1 ) return;

      var Y = 210-30*Math.sin(this.timer.time/2000*(Math.PI*2));

       var circle = circleModel.create({
         x: 500,
         y: Y,
         r: 0,
         color: undefined,
         borderWidth: 4,
         border: this.colours[timer.time/10%this.colours.length]});

       this.addChild(circle);

       var M = Movement;

       M.compile([
          [
            [4000, function() {
               circle.x = 350 - Math.random()*150;
               circle.alpha = 0;
             },
             Math.sqrt
            ],
            [4000, function() {
               circle.y = Y - 150 - Math.random() * 50;
               circle.r = 5 + Math.random() * 50;
             },
             M.easeIn(0.5)
            ]
          ],
          (function() { this.removeChild(circle); }).bind(this)
       ])();
    }
  }
});

