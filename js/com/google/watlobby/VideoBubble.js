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
  name: 'VideoBubble',

  extends: 'com.google.watlobby.TopicBubble',

  requires: [
    'foam.graphics.ImageCView',
    'foam.graphics.SimpleRectangle',
    'foam.graphics.ViewCView',
    'com.google.watlobby.VideoView'
  ],

  properties: [
    {
      name: 'playIcon',
      factory: function() { return this.ImageCView.create({src: 'js/com/google/watlobby/img/play.png', alpha: 0.35}); }
    },
    [ 'selected', false ],
    [ 'animating', false ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.addChild(this.playIcon);
    },
    function layout() {
      this.SUPER();
      if ( ! this.img ) return;
      this.playIcon.width = this.r / 0.8
      this.playIcon.height = this.r / 0.8;
      this.playIcon.x = -this.playIcon.width/2.2;
      this.playIcon.y = -this.playIcon.height/2;
    },
    function setSelected(selected) {
      this.selected = selected;
      if ( this.animating ) return;

      var lobby = this.lobby;

      if ( selected ) {
        this.children_ = [];
        var w = lobby.width;
        var h = lobby.height;

        var r = this.SimpleRectangle.create({background: 'black', alpha: 0, x: 0, y: 0, width: w, height: h});
        lobby.addChild(r);

        this.children_.push(r);

        var video = this.topic.video;
        var vw = Math.floor(Math.min(w, h * 1.77) * 0.7);
        var vh = Math.floor(vw / 1.77);

/*        var v = this.ViewCView.create({innerView: {
          toHTML: function() { return '<iframe width="' + vw + '" height="' + vh + '" src="https://www.youtube.com/embed/' + video + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'; },
          initHTML: function() {}
        }, x: this.x, y: this.y, width: 0, height: 0});
*/
        var v = this.ViewCView.create({
          innerView: this.VideoView.create({
            width: vw,
            height: vh,
            src: video
          }),
          x: this.x, y: this.y, width: 0, height: 0
        });

        lobby.collider.stop();
        Movement.compile([
          function() { this.animating = true; }.bind(this),
          [500, function() { this.alpha = 0; }.bind(this) ],
          [1000, function(i, j) {
            r.alpha = 0.7;
            v.width = vw;
            v.height = vh;
            v.x = (w-vw)/2;
            v.y = (h-vh)/2;
          }],
          function() { v.innerView.start(); this.animating = false; if ( ! this.selected ) this.setSelected(false); }.bind(this)
        ])();
        lobby.addChild(v);
        this.children_.push(v);
      } else {
        var r = this.children_[0];
        var v = this.children_[1];
        Movement.compile([
          function() { this.animating = true; }.bind(this),
          [ 500, function() { v.x = this.x; v.y = this.y; v.width = v.height = r.alpha = 0; }.bind(this) ],
          [ 500, function() { this.alpha = 1.0; }.bind(this) ],
          function() {
            v.destroy();
            lobby.collider.start();
            lobby.removeChild(v);
            lobby.removeChild(r);
          },
          function() { this.animating = false; if ( this.selected ) this.setSelected(true); }.bind(this)
        ])();
        this.children_ = [];
      }
    }
  ]
});
