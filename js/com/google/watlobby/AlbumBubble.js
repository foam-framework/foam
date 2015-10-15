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
  name: 'AlbumBubble',

  extends: 'com.google.watlobby.TopicBubble',

  requires: [
    'foam.graphics.SimpleRectangle',
    'com.google.watlobby.Bubble'
  ],

  properties: [
    {
      name: 'rows',
      defaultValue: 4
    },
    {
      name: 'columns',
      defaultValue: 6
    }
  ],

  methods: [
    function setSelected(selected) {
      if ( selected ) {
        this.children_ = [];
        var w = this.lobby.width / this.columns;
        var h = this.lobby.height / this.rows;

        var r = this.SimpleRectangle.create({background: 'black', alpha: 0, x: 0, y: 0, width: this.lobby.width, height: this.lobby.height});
        this.lobby.addChild(r);
        Movement.animate(1000, function() { r.alpha = 0.7; }, Movement.easy)();

        this.children_.push(r);

        for ( var i = 0 ; i < this.columns ; i++ ) {
          for ( var j = 0 ; j < this.rows ; j++ ) {
            var b = this.Bubble.create({
              r: 0, x: this.x, y: this.y, border: '#f00'
            });
            Movement.animate(1500, function(i, j) {
              this.r = Math.min(w, h) / 2 - 16;
              this.x = ( i + 0.5 ) * w;
              this.y = ( j + 0.5 ) * h;
            }.bind(b, i, j), Movement.oscillate(0.6, 0.03, 2))();
            this.lobby.addChild(b);
            this.children_.push(b);
          }
        }
      } else {
        // TODO: remove children from lobby when done
        var r = this.children_[0];
        Movement.animate(1000, function() { r.alpha = 0; })();
        for ( var i = 1 ; i < this.children_.length ; i++ ) {
          Movement.animate(1000, function() { this.r = 0; }.bind(this.children_[i]))();
        }
        this.children_ = [];
      }
    },
    function paintSelf() {
      if ( this.image ) {
        var d, s;
        if ( this.roundImage ) {
          d = 2 * this.r;
          s = -this.r;
        } else {
          d = 2 * this.r * Math.SQRT1_2;
          s = -this.r * Math.SQRT1_2;
        }
        this.img.x = this.img.y = s;
        this.img.width = this.img.height = d;
      }
      this.SUPER();
    }
  ]
});
