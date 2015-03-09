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
  name:  'LogoBackground',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.graphics.Circle'
  ],

  imports: [ 'colours$' ],

  properties: [
    {
      name: 'timer',
      factory: function() { return Timer.create(); },
      postSet: function(_, timer) {
        var self = this;
        timer.start();
        Events.dynamic(
          function() { timer.time; },
          function() { self.addBubble(); self.paint(); });
      }
    },
    { name: 'className', defaultValue: 'logo-background' }
  ],

  methods: {
    stop: function() {
      this.timer.stop();
      for ( var i in this.children ) this.children[i].stop();
    },
    addBubble: function() {
      var c = this.canvas;
      var Y = 120;
      var X = 10+Math.random()*310;

      var circle = this.Circle.create({
        x: X,
        y: Y,
        r: 5,
        alpha: 0.8,
        color: null,
        borderWidth: 1,
        border: this.colours[Math.floor(Math.random() * this.colours.length)]});

      this.addChild(circle);
      circle.stop = Movement.animate(
        4000,
        function() {
          circle.x = circle.x + Math.random()*200-100;
          circle.alpha = 0;
          circle.y = Y - 100 - Math.random() * 50;
          circle.r = 25 + Math.random() * 50;
          circle.borderWidth = 8;
        },
        Movement.easeIn(0.5),
        (function() {
          if ( this.timer.isStarted ) this.removeChild(circle);
        }).bind(this))();
    }
  }
});


CLASS({
  package: 'foam.demos.graphics',
  name:  'LogoForeground',
  extendsModel: 'foam.graphics.CView',

  imports: [ 'text$', 'font$' ],

  properties: [
    { name: 'className', defaultValue: 'logo-foreground' }
  ],

  methods: {
    paintSelf: function() {
      this.SUPER();
      var c = this.canvas;

      c.fillStyle = 'white';
      c.fillRect(0, 0, 700, 140);

      c.font = this.font;
      c.fillStyle = 'rgba(0,0,0,1)';
      c.strokeStyle = 'white';

/*
      c.shadowOffsetX = 5;
      c.shadowOffsetY = 5;
      c.shadowBlur = 8;
      c.shadowColor = '#999';
*/
      c.lineWidth = 1;
      c.strokeStyle = 'gray';
      c.globalCompositeOperation = '';
      c.strokeText(this.text, 0, 100);
      c.globalCompositeOperation = 'destination-out';

      c.fillText(this.text, 0, 100);

//      c.lineWidth = 5;
//      c.strokeText(this.text, 100, 100);
    }
  }  
});


CLASS({
  package: 'foam.demos.graphics',
  name:  'Logo',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.demos.graphics.LogoForeground',
    'foam.demos.graphics.LogoBackground'
  ],
 
  exports: [ 'text$', 'font$', 'colours$' ],

  properties: [
    {
      name: 'duration',
      defaultValue: 0
    },
    {
      model_: 'StringArrayProperty',
      name: 'colours',
      factory: function() { return ['#33f','#f00','#fc0','#33f','#3c0']; }
    },
    {
      name: 'text',
      defaultValue: 'FOAM'
    },
    {
      name: 'font',
      defaultValue: '120px Georgia'
    },
    {
      name: 'foreground',
      factory: function() {
        return this.LogoForeground.create({width: this.width, height: this.height});
      }
    },
    {
      name: 'background',
      factory: function() {
        return this.LogoBackground.create({width: this.width, height: this.height});
      }
    },
    { name: 'width',     defaultValue: 400 },
    { name: 'height',    defaultValue: 102 },
    { name: 'className', defaultValue: 'logo' }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      if ( this.duration ) {
        this.X.setTimeout(
          this.background.stop.bind(this.background),
          this.duration);
      }
    }
  },

  templates: [
    function toInnerHTML() {/* <%= this.background, this.foreground %> */},
    function CSS() {/*
      .logo-foreground { position: absolute; left: 0; }
      .logo-background { position: absolute; left: 0; z-index: -1; }
    */}
  ]
});
