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
  package: 'com.google.watlobby',
  name: 'TopicBubble',

  extendsModel: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.ImageCView',
    'foam.graphics.ViewCView',
    'foam.ui.TextFieldView'
  ],

  imports: [ 'lobby' ],

  properties: [
    { name: 'topic' },
    { name: 'image' },
    { name: 'roundImage' },
    { name: 'zoom', defaultValue: 0 },
    {
      name: 'textArea',
      factory: function() {
        return this.ViewCView.create({innerView: this.TextFieldView.create({
          className: 'topic-bubble-text',
          mode: 'read-only',
          escapeHTML: false,
          data: 'foobar\nblah\nblah\nblah'
        })});
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.addChild(this.img = this.ImageCView.create({src: this.image}));
      this.addChild(this.textArea);
      this.textArea.innerView.data = this.topic.text || 'INSERT TEXT HERE';
      this.textArea.alpha = 0;
    },
    function setSelected(selected) {
      if ( this.cancel_ ) {
        this.cancel_();
        this.cancel_ = null;
      }
      if ( selected ) {
        this.oldMass_ = this.oldMass_ || this.mass;

        this.mass = this.INFINITE_MASS;
        this.vx = this.vy = 0;
        this.cancel_ = Movement.animate(1000, function() {
          var w = this.lobby.width;
          var h = this.lobby.height;
          this.x = w/2;
          this.y = h/2;
          this.zoom = 1;
          this.textArea.alpha = 1;
        }.bind(this), Movement.easey)();
      } else {
        this.mass = this.oldMass_;
        this.cancel_ = Movement.compile([[
          [ 200,  function() { this.textArea.alpha = 0; }.bind(this) ],
          [ 1000, function() { this.zoom = 0; }.bind(this) ]
        ]])();
      }
    },
    function layout() {
      if ( ! this.img ) return;

      var c = this.canvas;

      this.r = this.topic.r;

      if ( this.zoom ) {
        var w = this.lobby.width;
        var h = this.lobby.height;
        var r = Math.min(w, h)/2.3;

        this.r += (r - this.topic.r) * this.zoom;

        this.textArea.width = this.textArea.height = this.zoom * this.r*0.9;
        this.textArea.y = - this.textArea.height / 2;
        this.textArea.x = 20;
      } else {
        this.textArea.width = this.textArea.height = 0;
      }

      var r2 = this.roundImage ?
        (1-0.15*this.zoom)*this.r + 2 :
        Math.SQRT1_2 * this.r;
      this.img.x      = this.roundImage ? -r2 - 0.15*this.zoom*this.r/1.5 : -r2 * (1+this.zoom/4);
      this.img.y      = -r2 / (1+this.zoom);
      this.img.width  = (2-this.zoom) * r2;
      this.img.height = (2-this.zoom) * r2;
    },
    function paint() {
      this.layout();
      this.SUPER();
    },
    function paintBorder() { },
    function paintChildren() {
      this.SUPER();
      foam.graphics.Circle.getPrototype().paintBorder.call(this);
    }
  ]
});
