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
  name: 'Topic',

  properties: [
    { name: 'topic' },
    { name: 'image' },
    { name: 'color' },
    { name: 'background' },
    { name: 'r' },
    { name: 'model', defaultValue: 'Topic' },
    { name: 'roundImage' },
    { name: 'video' },
    { name: 'text' }
  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'Bubble',

  extendsModel: 'foam.demos.physics.PhysicalCircle',

  properties: [
    { name: 'borderWidth', defaultValue: 20 },
    { name: 'color',       defaultValue: 'white' }
  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'TopicBubble',

  extendsModel: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.SimpleRectangle',
    'foam.graphics.ImageCView',
  ],

  imports: [ 'lobby' ],

  properties: [
    { name: 'topic' },
    { name: 'image' },
    { name: 'roundImage' },
    { name: 'zoom', defaultValue: 0 }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.addChild(this.img = this.ImageCView.create({src: this.image}));
      this.addChild(this.textArea = this.SimpleRectangle.create({alpha: 0, background: this.border}));
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
        this.cancel_ = Movement.animate(2000, function() {
          var w = this.lobby.width;
          var h = this.lobby.height;
          this.x = w/2;
          this.y = h/2;
          this.zoom = 1;
          this.textArea.alpha = 0.1;
        }.bind(this), Movement.easy)();
      } else {
        this.mass = this.oldMass_;
        this.cancel_ = Movement.animate(2000, function() {
          this.zoom = 0;
          this.textArea.alpha = 0;
        }.bind(this), Movement.easy)();
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
        this.textArea.x = -20;
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


CLASS({
  package: 'com.google.watlobby',
  name: 'VideoBubble',

  extendsModel: 'com.google.watlobby.TopicBubble',

  requires: [
    'foam.graphics.ImageCView',
    'foam.graphics.SimpleRectangle',
    'foam.graphics.ViewCView'
  ],

  properties: [
    {
      name: 'playIcon',
      factory: function() { return this.ImageCView.create({src: 'play.png', x:-40, y:-40, width: 80, height: 80, alpha: 0.25}); }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.addChild(this.playIcon);
    },
    function setSelected(selected) {
      var lobby = this.lobby;
      if ( selected ) {
        this.children_ = [];
        var w = lobby.width;
        var h = lobby.height;

        var r = this.SimpleRectangle.create({background: 'black', alpha: 0, x: 0, y: 0, width: w, height: h});
        lobby.addChild(r);
//        Movement.animate(1500, function() { r.alpha = 0.7; })();

        this.children_.push(r);

        var video = this.topic.video;
        var vw = Math.floor(Math.min(w, h * 1.77) * 0.7);
        var vh = Math.floor(vw / 1.77);

        var v = this.ViewCView.create({innerView: {
          toHTML: function() { return '<iframe width="' + vw + '" height="' + vh + '" src="https://www.youtube.com/embed/' + video + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'; },
          initHTML: function() {}
        }, x: this.x, y: this.y, width: 0, height: 0});

        lobby.collider.stop();
        Movement.compile([
          [500, function() { this.alpha = 0; }.bind(this) ],
          [1000, function(i, j) {
            r.alpha = 0.7;
            v.width = vw;
            v.height = vh;
            v.x = (w-vw)/2;
            v.y = (h-vh)/2;
          }]
        ])();
        lobby.addChild(v);
        this.children_.push(v);
      } else {
        // TODO: remove children from lobby when done
        var r = this.children_[0];
        var v = this.children_[1];
//        lobby.collider.stop();
        Movement.compile([
          [ 500, function() { v.x = this.x; v.y = this.y; v.width = v.height = r.alpha = 0; }.bind(this) ],
          [ 500, function() { this.alpha = 1.0; }.bind(this) ],
          function() {
            v.destroy();
            lobby.collider.start();
            lobby.removeChild(v);
            lobby.removeChild(r);
          }
        ])();
        this.children_ = [];
      }
    }
  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'PhotoAlbumBubble',

  extendsModel: 'com.google.watlobby.TopicBubble',

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
            Movement.animate(2000, function(i, j) {
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


CLASS({
  package: 'com.google.watlobby',
  name: 'Lobby',
  extendsModel: 'foam.graphics.CView',
  traits: [ 'com.google.misc.Colors' ],

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.PhotoAlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.ClockView',
    'foam.demos.graphics.Logo',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView',
    'foam.physics.PhysicsEngine as Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer' ],
  exports: [ 'as lobby' ],

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 25 },
    { name: 'airBubbles', defaultValue: 0, model_: 'IntProperty' },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      var c = this.Collider.create();
      var w = this.width;
      var h = this.height;
      var self = this;
      c.detectCollisions = function() {
        var cs = this.children;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          var c1 = cs[i];
          this.updateChild(c1);
          var r = c1.r + 10;

          // Add Coriolis Effect
          var a = Math.atan2(c1.y-h/2, c1.x-w/2);
          var d = Movement.distance(c1.y-h/2, c1.x-w/2);
          // Keeps topic bubbles from going too far off screen
          // if ( c1.topic && d > h / 2 - r) c1.out_ = false;
          if ( d > w / 2 - r ) c1.out_ = false;
          if ( d < h/4 ) c1.out_ = true;
          // c1.color = c1.out_ ? 'orange' : 'blue';

          // The 0.9 gives it a slight outward push
          if ( c1.mass != c1.INFINITE_MASS )
            c1.applyMomentum((0.5+0.4*c1.$UID%11/10) * c1.mass/4, a+(c1.out_ ? 0.9 : 1.1)*Math.PI/2);

          // Make collision detection 5X faster by only checking every fifth time.
          if ( ( self.timer.i + i ) % 5 == 0 ) for ( var j = i+1 ; j < cs.length ; j++ ) {
            var c2 = cs[j];
            if ( c1.intersects(c2) ) this.collide(c1, c2);
          }
        }
      };
      return c;
    }},
    {
      name: 'topics',   factory: function() {
      return JSONUtil.arrayToObjArray(this.X, [
        { topic: 'chrome',       image: 'chrome.png',       r: 180, color: this.RED,   roundImage: true },
        { topic: 'flip',         image: 'flip.png',         r: 110, color: this.RED },
        { topic: 'pixel',        image: 'pixel.png',        r: 110, color: this.RED },
        { topic: 'googlecanada', image: 'googlecanada.png', r: 200, color: this.RED,   roundImage: true },
        { topic: 'onhub',        image: 'onhub.png',        r: 120, color: this.GREEN, roundImage: true },
        { topic: 'onhubvideo',   image: 'onhublogo.png',    r: 120, color: this.BLUE,  roundImage: true, video: 'HNnfHP7VDP8', model: 'Video' },
        { topic: 'inbox',        image: 'inbox.png',        r: 160, color: this.BLUE },
        { topic: 'android',      image: 'android.png',      r: 100, color: this.GREEN },
        { topic: 'calc',         image: 'calculator.png',   r: 100, color: this.GREEN },
        { topic: 'gmailoffline', image: 'gmailoffline.png', r: 160, color: this.BLUE },
        { topic: 'fiber',        image: 'fiber.png',        r: 180, color: this.BLUE },
        { topic: 'foam',         image: 'foam_whiteontransparent.png', r: 80, color: 'red', roundImage: true, background: 'red' },
        { topic: 'inwatvideo',   image: 'inwatvideo.png',   r: 120, model: 'Video', video: '1Bb29KxXzDs', roundImage: true },
        { topic: 'appbuilder',   image: 'appbuilder.png',   r: 120, model: 'Video', video: 'HvxKHj9QmMI' },
        { topic: 'photos',       image: 'photoalbum.png',   r: 110, model: 'PhotoAlbum', color: this.YELLOW, roundImage: true }
      ], this.Topic);
    }}
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(evt) {
        var self = this;
        // console.log('********************* onClick', evt);
        var child = this.collider.findChildAt(evt.clientX, evt.clientY);
        if ( child === this.selected ) return;

        if ( this.selected ) {
          this.selected.setSelected(false);
          this.selected = null;
        }

        if ( child && child.setSelected ) {
          this.selected = child
          child.setSelected(true);
        }
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      this.addBubbles();
      this.addTopicBubbles();

      document.body.addEventListener('click', this.onClick);

      var foam = this.ImageCView.create({x: 10, y: this.height-100, width: 837/2.9, height: 269/2.9, src: 'foampowered_red.png'});
      this.addChild(foam);

      var clock = this.ClockView.create({x: this.width-120, y: 120, r: 120-10});
      this.addChild(clock);

      this.collider.start();
    },

    function addTopicBubbles() {
      for ( var i = 0 ; i < this.topics.length ; i++ ) {
        var color = this.COLORS[i % this.COLORS.length];
        var t = this.topics[i];
        var c = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble').create({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          border: color
        }, this.Y);
        c.topic = t;
        c.image = t.image;
        c.r = t.r;
        c.roundImage = t.roundImage;
        if ( t.color ) c.border = t.color;
        if ( t.background ) c.color = t.background;
        this.addChild(c);

        c.mass = c.r/150;
        c.gravity = 0;
        c.friction = 0.94;
        this.collider.add(c);
      }
    },

    function addBubbles() {
      var N = this.n;
      for ( var i = 0 ; i < N ; i++ ) {
        var color = this.COLORS[Math.floor(i / N * this.COLORS.length)];
        var c = this.Bubble.create({
          r: 10 + Math.random() * 60,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          color: null,
          border: color
        });
        this.addChild(c);

        c.mass = c.r/150;
        c.gravity = 0;
        c.friction = 0.94;
        this.collider.add(c);
      }
    },

    function destroy() {
      this.SUPER();
      this.collider.destroy();
    }
  ]
});
