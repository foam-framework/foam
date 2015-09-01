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
  name: 'LogoBackground',
  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Circle', 'foam.util.Timer' ],

  imports: [ 'colors$', 'width$', 'height$' ],

  properties: [
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); },
      postSet: function(_, timer) {
        timer.time$.addListener(function() { this.addBubble(); }.bind(this));
      }
    },
    { name: 'className', defaultValue: 'logo-background' }
  ],

  methods: {
    initCView: function() {
      this.SUPER();
      this.timer.start();
    },
    destroy: function() {
      this.SUPER();
      this.timer.stop();
    },
    stop: function() {
      this.timer.stop();
      for ( var i in this.children ) this.children[i].stop();
    },
    addBubble: function() {
      if ( ! this.view.$ ) this.destroy();
      var c = this.canvas;
      var Y = this.height+15;
      var X = 10+Math.random()*(this.width-20);

      var circle = this.Circle.create({
        x: X,
        y: Y,
        r: 15,
        alpha: 0.4,
        color: null,
        borderWidth: 2,
        border: this.colors[Math.floor(Math.random() * this.colors.length)]}) || '#000000';

      this.addChild(circle);
      circle.stop = Movement.animate(
        10000,
        function() {
          circle.x = circle.x + Math.random()*200-100;
          circle.alpha = 0;
          circle.y = 0;
          circle.r = 15 + Math.random() * 50;
          //circle.borderWidth = 1;
        },
        Movement.easeOut(0.5),
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

  imports: [ 'text$', 'font$', 'width$', 'height$' ],

  properties: [
    { name: 'className', defaultValue: 'logo-foreground' }
  ],

  methods: {
    paintSelf: function() {
      var c = this.canvas;

      c.fillStyle = 'white';
      c.fillRect(0, 0, this.width, this.height);

      c.font = this.font;
      c.fillStyle = 'rgba(0,0,0,1)';
      c.strokeStyle = 'white';

      c.lineWidth = 3;
      c.strokeStyle = '#888';
      c.globalCompositeOperation = '';
      c.strokeText(this.text, 0, this.height-5);
      c.globalCompositeOperation = 'destination-out';

      c.fillText(this.text, 0, this.height-5);
    }
  }
});


CLASS({
  package: 'foam.demos.graphics',
  name:  'Logo',
  extendsModel: 'foam.ui.View',
  traits: [ 'foam.ui.Colors' ],

  requires: [
    'foam.demos.graphics.LogoForeground',
    'foam.demos.graphics.LogoBackground',
    'foam.ui.TextFieldView'
  ],

  exports: [ 'text$', 'font$', 'colors$', 'width$', 'height$' ],

  properties: [
    {
      name: 'duration',
      defaultValue: 0
    },
    {
      model_: 'StringArrayProperty',
      name: 'colors',
      singular: 'color',
      factory: function() { return this.COLORS; }
    },
    {
      name: 'text',
      defaultValue: 'FOAM'
    },
    {
      name: 'font',
      defaultValue: '120px Georgia'
    },
    { name: 'width',     defaultValue: 400 },
    { name: 'height',    defaultValue: 103 },
    {
      name: 'foreground',
      factory: function() {
        return this.LogoForeground.create();
      }
    },
    {
      name: 'background',
      factory: function() {
        return this.LogoBackground.create();
      }
    },
    { name: 'className', defaultValue: 'logo' }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.$.style.width  = this.width;
      this.$.style.height = this.height;

      if ( this.duration ) {
        this.X.setTimeout(
          this.background.stop.bind(this.background),
          this.duration);
      }
    }
  },

  templates: [
    function toInnerHTML() {/* <%= this.background, this.foreground %>$$text{ tagName: 'logo-text', mode: 'read-only' } */},
    function CSS() {/*
      .logo { display: block; position: relative; }
      .logo-foreground { position: absolute; left: 0; }
      .logo-background { position: absolute; left: 0; z-index: -1; }
      @media not print { logo-text { display: none; } }
      @media print {
        .logo {
          height: initial !important;
          margin: initial !important;
          padding: initial !important;
          position: initial !important;
        }
        .logo-foreground, .logo-background { display: none; }
        logo-text { display: block; }
      }
    */}
  ]
});
