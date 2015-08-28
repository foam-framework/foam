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
    { name: 'colour' },
    { name: 'r' },
    { name: 'model', defaultValue: 'com.google.watlobby.Bubble' },
    {name: 'roundImage' }
  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'Bubble',

  extendsModel: 'foam.demos.physics.PhysicalCircle',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.ImageCView',
  ],

  imports: [ 'lobby' ],

  properties: [
    { name: 'topic' },
    { name: 'image' },
    { name: 'roundImage' },
    { name: 'borderWidth', defaultValue: 8 },
    { name: 'color',       defaultValue: 'white' },
    { name: 'ring' }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      if ( this.image ) {
        var img = this.ImageCView.create({src: this.image});
        this.addChild(img);
        this.img = img;
      }
      // For roundImages we want to draw the border above our children to
      // hide any blending issues at the border. To do this we add another
      // Circle child.
      if ( this.roundImage ) {
        this.ring = this.Circle.create({color: null});
        this.addChild(this.ring);
      }
    },
    function setSelected(selected) {
      if ( this.cancel_ ) {
        this.cancel_();
        this.cancel_ = null;
      }
      if ( selected ) {
        this.oldMass_ = this.oldMass_ || this.mass;
        this.oldR_ = this.oldR_ || this.r;

        this.mass = this.INFINITE_MASS;
        this.vx = this.vy = 0;
        this.cancel_ = Movement.animate(2000, function() {
          var width = this.lobby.width;
          var height = this.lobby.height;
          this.r = Math.min(width, height)/2.3;
          this.x = width/2;
          this.y = height/2;
        }.bind(this), Movement.easy)();
      } else {
        this.mass = this.oldMass_;
        this.cancel_ = Movement.animate(1000, function() {
          this.r = this.oldR_;
        }.bind(this), Movement.easy)();
      }
    },
    function paintChildren() {
      if ( this.ring ) {
        this.ring.r = this.r;
        this.ring.borderWidth = this.borderWidth;
        this.ring.border = this.border;
      }

      if ( this.image ) {
        var d, s;
        if ( this.roundImage ) {
          d = 2 * this.r + 6;
          s = -this.r - 3;
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
  name: 'VideoBubble',

  extendsModel: 'com.google.watlobby.Bubble',

  requires: [
    'com.google.watlobby.Bubble',
    'foam.graphics.ImageCView',
    'foam.graphics.SimpleRectangle',
    'foam.graphics.ViewCView'
  ],

  properties: [
    {
      name: 'video',
      defaultValue: '1Bb29KxXzDs'
    },
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

        var r = this.SimpleRectangle.create({background: 'black', alpha: 0, x: 0, y: 0, width: lobby.width, height: lobby.height});
        lobby.addChild(r);
//        Movement.animate(1500, function() { r.alpha = 0.7; })();

        this.children_.push(r);

        var video = this.video;
        var vw = Math.floor(Math.min(w, h * 1.77) * 0.7);
        var vh = Math.floor(vw / 1.77);

        var v = this.ViewCView.create({innerView: {
          toHTML: function() { return '<iframe width="' + vw + '" height="' + vh + '" src="https://www.youtube.com/embed/' + video + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'; },
          initHTML: function() {}
        }, x: this.x, y: this.y, width: 0, height: 0});

        this.r_ = this.r;
        lobby.collider.stop();
        Movement.compile([
          [500, function() { this.r = 0; }.bind(this) ],
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
          [ 500, function() { this.r = this.r_ }.bind(this) ],
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

  extendsModel: 'com.google.watlobby.Bubble',

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
              this.r = Math.min(w, h) / 2 - 6;
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
  name: 'AirBubble',
  extendsModel: 'foam.demos.physics.PhysicalCircle'
});


CLASS({
  package: 'com.google.watlobby',
  name: 'Lobby',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'com.google.watlobby.AirBubble',
    'com.google.watlobby.Bubble',
    'com.google.watlobby.PhotoAlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.ClockView',
    'foam.demos.physics.PhysicalCircle',
    'foam.physics.PhysicsEngine as Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer' ],
  exports: [ 'as lobby' ],

  constants: {
    RED:    '#EA4335',
    GREEN:  '#34A853',
    BLUE:   '#4285F4',
    YELLOW: '#FBBC05',
    COLOURS: [ '#EA4335', '#34A853', '#4285F4', '#FBBC05' ]
  },

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 20 },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      var c = this.Collider.create();
      var w = this.width;
      var h = this.height;
      // Make collision detection much faster by not checking
      // if air bubbles collide with other air bubbles
      c.detectCollisions = function() {
        var cs = this.children;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          var c1 = cs[i];
          this.updateChild(c1);

          if ( c1.r !== 5 ) {
            // Bounce on Walls
            var r = c1.r * 1.2;
            if ( c1.x < r     ) { c1.vx += 0.2; c1.vy -= 0.19; }
            if ( c1.x > w - r ) { c1.vx -= 0.2; c1.vy += 0.19; }
            if ( c1.y < r && ! com.google.watlobby.AirBubble.isInstance(c1) ) { c1.vy += 0.2; c1.vx += 0.19; }
            if ( c1.y > h - r ) { c1.vy -= 0.2; c1.vx -= 0.19; }

            for ( var j = i+1 ; j < cs.length ; j++ ) {
              var c2 = cs[j];
              if ( c1.intersects(c2) ) this.collide(c1, c2);
            }
          }
        }
      };
      return c;
    }},
    {
      name: 'topics',   factory: function() {
      return JSONUtil.arrayToObjArray(this.X, [
        { topic: 'chrome',       image: 'chrome.png',       r: 180, roundImage: true, colour: this.RED },
        { topic: 'flip',         image: 'flip.jpg',         r: 100, colour: this.RED },
        { topic: 'googlecanada', image: 'googlecanada.gif', r: 200 },
        { topic: 'inbox',        image: 'inbox.png',        r: 160, colour: this.BLUE },
        { topic: 'android',      image: 'android.png',      r: 90, colour: this.GREEN },
        { topic: 'gmailoffline', image: 'gmailoffline.jpg', r: 160 },
        { topic: 'fiber',        image: 'fiber.jpg',        r: 180, colour: this.BLUE },
        { topic: 'foam',         image: 'foampowered.png',  r: 100, colour: 'darkblue' },
        { topic: 'inwatvideo',   image: 'inwatvideo.png', roundImage: true, r: 100, model: 'com.google.watlobby.VideoBubble' },
        { topic: 'photos',       image: 'photoalbum.png', roundImage: true, r: 90, model: 'com.google.watlobby.PhotoAlbumBubble' },
        // chromebook, mine sweeper, calculator, I'm feeling lucky
        // thtps://www.youtube.com/watch?v=1Bb29KxXzDs, <iframe width="560" height="315" src="https://www.youtube.com/embed/1Bb29KxXzDs" frameborder="0" allowfullscreen></iframe>

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

      for ( var i = 0 ; i < this.topics.length ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var t = this.topics[i];
        var c = this.X.lookup(t.model).create({
          r: 20 + Math.random() * 50,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          border: colour
        }, this.Y);
        c.topic = t;
        c.image = t.image;
        c.r = t.r;
        c.roundImage = t.roundImage;
        if ( t.colour ) c.border = t.colour;
        this.addChild(c);

        c.mass = c.r/50;
        c.gravity = 0.025;
        c.friction = 0.96;
        this.collider.add(c);
      }

      var N = this.n;
      for ( var i = 0 ; i < N ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var c = this.Bubble.create({
          r: 20 + Math.random() * 50,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          color: 'white',
          border: colour
        });
        this.addChild(c);

        c.mass = c.r/150;
        c.gravity = 0.025;
        c.friction = 0.94;
        this.collider.add(c);
      }

      for ( var i = 0 ; i < 100 ; i++ ) {
        var b = this.AirBubble.create({
          r: 6,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          borderWidth: 0.5,
          color: 'rgba(0,0,255,0.2)',
          border: '#blue',
//          color: 'rgba(100,100,200,0.2)',
//          border: '#55a',
          mass: 0.7
        });

        b.y$.addListener(function(b) {
          if ( b.y < -5 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }.bind(this, b));

        b.vy = -4;
        b.gravity = -0.4;
        b.friction = 0.8;
        this.collider.add(b);

        this.addChild(b);

//        this.view.$.addEventListener('click', this.onClick);
       document.body.addEventListener('click', this.onClick);

      }

      var clock = this.ClockView.create({x:this.width-70,y:70, r:60});
      this.addChild(clock);

      this.collider.start();
    },

    function destroy() {
      this.SUPER();
      this.collider.destroy();
    }
  ]
});
