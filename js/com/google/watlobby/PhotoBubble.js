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
  name: 'PhotoBubble',

  extends: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.ImageCView',
    'foam.graphics.ViewCView'
  ],

  imports: [ 'lobby', 'window' ],

  properties: [
    'topic', 'image', 'roundImage', [ 'zoom', 0 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.r = this.topic.r;
      this.addChild(this.img = this.ImageCView.create({src: '/js/com/google/watlobby/' + this.image}));
    },
    function setSelected(selected) {
      var self = this;
      if ( selected ) {
        this.oldMass_ = this.oldMass_ || this.mass;

        this.mass = this.INFINITE_MASS;
        this.vx = this.vy = 0;
        this.cancel_ = Movement.compile([
          [ 800, function() {
            var w = self.lobby.width;
            var h = self.lobby.height;
            self.x = w/2;
            self.y = h/2;
            self.zoom = 1;
        }, Movement.easey ]
      ])();
      } else {
        this.mass = this.oldMass_;
        Movement.compile([
          [ 800, function() { self.zoom = 0; } ]
        ])();
      }
    },
    function layout() {
      if ( ! this.img ) return;

      var w = this.window.innerWidth;
      var h = this.window.innerHeight;
      var maxR = Math.min(w, h)/3;
      this.r = this.topic.r * ( 1-this.zoom ) + this.zoom * maxR;
      var c = this.canvas;

      var r2 = this.roundImage ?
        (this.r + 4) :
        Math.SQRT1_2 * this.r ;

      this.img.width  = 2*r2;
      this.img.height = 2*r2;
      this.img.x      = -this.img.width/2;
      this.img.y      = -this.img.height/2;
    },
    function paint() {
      this.layout();
      this.SUPER();
    },
    function paintBorder() { },
    function paintChildren() {
      var c = this.canvas;
      if ( this.roundImage ) {
        c.save();
        c.beginPath();
        c.arc(0, 0, this.r, 0, 2 * Math.PI, false);
        c.clip();
      }
      this.SUPER();
      if ( this.roundImage ) c.restore();
      foam.graphics.Circle.getPrototype().paintBorder.call(this);
    }
  ]
});
