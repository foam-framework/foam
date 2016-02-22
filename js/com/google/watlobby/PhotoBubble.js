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
    'image',
    'topic', 'roundImage', [ 'zoom', 0 ]
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.r = this.topic.r;
      this.addChild(this.img = this.ImageCView.create({src: this.image }));
    },
    function setSelected(selected) {
      var self = this;
      if ( selected ) {
        this.oldMass_ = this.oldMass_ || this.mass;

        this.mass = this.INFINITE_MASS;
        this.vx = this.vy = 0;
        this.cancel_ = Movement.compile([
          [ 400, function() {
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
          [ 400, function() { self.zoom = 0; } ]
        ])();
      }
    },
    function layout() {
      if ( ! this.img ) return;

      var z = this.zoom;

      this.r = this.topic.r;

      if ( z ) {
        var w = this.lobby.width;
        var h = this.lobby.height;
        var r = Math.min(w, h)/3;

        this.r += (r - this.topic.r) * z;
      }

      var r2 = this.roundImage ?
        this.r + 2 :
        Math.SQRT1_2 * this.r ;

      if ( this.img.image_ && this.img.image_.width ) {
        var w = this.img.image_.width;
        var h = this.img.image_.height;
        var min = Math.min(w, h);
        this.img.width  = w * (2 * r2)/min;
        this.img.height = h * (2 * r2)/min;
        this.img.x      = -this.img.width/2;
        this.img.y      = -this.img.height/2;
      }
    },
    function paint(c) {
      this.layout();
      this.SUPER(c);
    },
    function paintBorder(c) { },
    function paintChildren(c) {
      var needsCrop = this.roundImage || this.img.width != this.img.height;
      if ( needsCrop ) {
        c.save();
        c.beginPath();
        c.arc(0, 0, this.r, 0, 2 * Math.PI, false);
        c.clip();
      }
      this.SUPER(c);
      if ( needsCrop ) c.restore();
      foam.graphics.Circle.getPrototype().paintBorder.call(this, c);
    }
  ]
});
