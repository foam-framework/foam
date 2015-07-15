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

  extendsModel: 'foam.demos.physics.PhysicalGLCircle',

  requires: [
    'foam.graphics.webgl.FlatImage',
    'foam.graphics.webgl.Circle'
  ],

  imports: [ 'lobby' ],

  properties: [
    { name: 'topic' },
    {
       name: 'image',
       postSet: function() {
         if ( this.image ) {
           var img = this.FlatImage.create({src: this.image, z: -0.5});
           if ( this.roundImage ) {
             img.shapeName = 'flatUnitCircle';
           }
           this.addChild(img);
           this.img = img;
           this.r = this.r;
         }
       }
    },
    { name: 'roundImage' },
    { name: 'borderRatio', defaultValue: 0.05 },
    { name: 'color' },
    { name: 'background' },
    {
      name: 'r',
      postSet: function() {
        if ( this.img ) {
          var d, s;
          if ( this.roundImage ) {
            this.borderRatio = 0.0001;
            d = 2 * this.r;
            s = -this.r;
          } else {
            d = 2 * this.r * Math.SQRT1_2;
            s = -this.r * Math.SQRT1_2;
          }
          this.img.x = this.img.y = s;
          this.img.width = this.img.height = d;
        }
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.background = this.Circle.create({ r$: this.r$, color: [1,1,1,1], z: -0.9});
      this.addChild(this.background);


    },

    function setSelected(selected) {
      if ( this.cancel_ ) {
        this.cancel_();
        this.cancel_ = null;
      }
      if ( selected ) {
        this.oldMass_ = this.oldMass_ || this.mass;
        this.oldR_ = this.oldR_ || this.r;
        this.oldZ_ = this.oldZ_ || this.z;

        this.mass = this.INFINITE_MASS;
        this.vx = this.vy = 0;
        this.cancel_ = Movement.animate(2000, function() {
          var width = this.lobby.width;
          var height = this.lobby.height;
          this.z = 500;

          this.r = Math.min(width, height)/2.3;
          this.angle = Math.PI*2;
          this.x = width/2;
          this.y = height/2;
        }.bind(this), Movement.ease(0.4,0.2))();
      } else {
        this.mass = this.oldMass_;
        this.cancel_ = Movement.animate(1000, function() {
          this.r = this.oldR_;
          this.z = this.oldZ_;
          this.angle = 0;
        }.bind(this), Movement.ease(0.4,0.2))();
      }
    },

  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'VideoBubble',

  extendsModel: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.webgl.FlatImage',
    'foam.graphics.webgl.Rectangle',
    'foam.graphics.ViewCView',
    'com.google.watlobby.Bubble',
    'foam.graphics.webgl.FlatVideo'
  ],

  properties: [
    {
      name: 'video',
      defaultValue: '1Bb29KxXzDs'
    },
    {
      name: 'playIcon',
      factory: function() { return this.FlatImage.create({src: 'play.png', x:-40, y:-40, width: 80, height: 80, alpha: 0.25}); }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      this.addChild(this.playIcon);
    },
    function setSelected(selected) {
      if ( selected ) {
        this.children_ = [];
        var w = this.lobby.width;
        var h = this.lobby.height;

        var r = this.Rectangle.create({color: [0,0,0,0.1], x: 0, y: 0, z: 2, width: this.lobby.width, height: this.lobby.height});
        this.lobby.addChild(r);
        Movement.animate(1000, function() { r.alpha = 0.7; })();

        this.children_.push(r);

        var video = this.video;
        var vw = 560*2.5;
        var vh = 315*2.5;

        var v = this.FlatVideo.create({
          x: this.x, y: this.y, z: 800, width: 0, height: 0, axis: [1,1,1],
          src:"Google in Waterloo Region - Ontario  Canada.mp4",
          translucent: true,
          shapeName: 'flatUnitCircle'
        });

        Movement.animate(2000, function(i, j) {
          v.width = vw;
          v.height = vh;
          v.x = (w-vw)/2;
          v.y = (h-vh)/2;
          v.z = 1000;
          v.angle = Math.PI*2;
        }, Movement.oscillate(0.6, 0.03, 2))();
        this.lobby.addChild(v);
        this.children_.push(v);
      } else {
        // TODO: remove children from lobby when done
        var r = this.children_[0];
        var v = this.children_[1];
        Movement.animate(1000, function() { r.alpha = 0; r.z = -100 })();
        /*
        for ( var i = 1 ; i < this.children_.length ; i++ ) {
          Movement.animate(1000, function() { this.width = this.height = 0; }.bind(this.children_[i]))();
        }
        */
        v.destroy();
        this.lobby.removeChild(v);
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
    'foam.graphics.webgl.Rectangle',
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
    function init() {
      this.SUPER();

      this.children_ = [];
      var w = this.lobby.width / this.columns;
      var h = this.lobby.height / this.rows;

      var r = this.Rectangle.create({color: [0,0,0,0], alpha: 0, x: 0, y: 0, z: -1, width: this.lobby.width, height: this.lobby.height});
      this.lobby.addChild(r);

      this.children_.push(r);

      for ( var i = 0 ; i < this.columns ; i++ ) {
        for ( var j = 0 ; j < this.rows ; j++ ) {
          var b = this.Bubble.create({
            r: 0, x: this.x, y: this.y, z: 2, border: '#f00'
          });
          this.lobby.addChild(b);
          this.children_.push(b);
        }
      }


    },
    function setSelected(selected) {
      if ( selected ) {
        var w = this.lobby.width / this.columns;
        var h = this.lobby.height / this.rows;

        var r = this.children_[0];
        Movement.animate(1000, function() { r.alpha = 0.7; r.z = 1; })();

        for ( var i = 0 ; i < this.columns ; i++ ) {
          for ( var j = 0 ; j < this.rows ; j++ ) {
            var b = this.children_[ i * this.rows + j + 1];
            b.x = this.x;
            b.y = this.y;
            b.z = 2;
            Movement.animate(2000, function(i, j) {
              this.r = Math.min(w, h) / 2 - 6;
              this.x = ( i + 0.5 ) * w;
              this.y = ( j + 0.5 ) * h;
            }.bind(b, i, j), Movement.oscillate(0.6, 0.03, 2))();
          }
        }
      } else {
        // TODO: remove children from lobby when done
        var r = this.children_[0];
        Movement.animate(1000, function() { r.alpha = 0; r.z = 1; })();
        for ( var i = 1 ; i < this.children_.length ; i++ ) {
          Movement.animate(1000, function() { this.r = 0; }.bind(this.children_[i]))();
        }
      }
    },
  ]
});



CLASS({
  package: 'com.google.watlobby',
  name: 'LobbyGL',
  extendsModel: 'foam.graphics.webgl.FlatScene',

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.PhotoAlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.ClockView',
    'foam.demos.physics.PhysicalGLCircle',
    'foam.physics.Collider',
    'foam.util.Timer',
    'foam.graphics.webgl.Circle as GLCircle',
    'foam.graphics.webgl.PerformanceScaler',
  ],

  imports: [ 'timer' ],
  exports: [ 'as lobby' ],

  constants: {
    COLOURS: [[0.19, 0.19, 1.0, 1.00],[1.0, 0.0, 0.0, 1.00],[1.0, 0.75, 0.0, 1.00], [0.19, 0.75, 0.0, 1.00]]
  },

  properties: [
    { name: 'targetFps',  defaultValue: 50 },
    { name: 'timer' },
    { name: 'n',          defaultValue: 30 },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      var c = this.Collider.create();
      // Make collision detection much faster by not checking
      // if air bubbles collide with other air bubbles
      c.detectCollisions = function() {
        var cs = this.children;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          var c1 = cs[i];
          if ( c1.r === 5 ) return;
          for ( var j = i+1 ; j < cs.length ; j++ ) {
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
        { topic: 'chrome',       image: 'chrome.png',       r: 180, roundImage: true, colour: [1.0, 0.0, 0.0, 1.00] },
        { topic: 'flip',         image: 'flip.jpg',         r: 100, colour: [1.0, 0.0, 0.0, 1.00] },
        { topic: 'googlecanada', image: 'googlecanada.gif', r: 200 },
        { topic: 'inbox',        image: 'inbox.png',        r: 160 },
        { topic: 'android',      image: 'android.png',      r: 90, colour: [0.19, 0.75, 0.0, 1.00] },
        { topic: 'gmailoffline', image: 'gmailoffline.jpg', r: 160 },
        { topic: 'fiber',        image: 'fiber.jpg',        r: 180 },
        { topic: 'foam',         image: 'foampowered.png',  r: 100, colour: [0.0, 0.0, 0.54, 1.00] },
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
    function init() {
      this.SUPER();

//      this.cameraDistance = -6.0;

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
          z: -i,
          color: colour,
          axis: [1,1,1]
        }, this.Y);
        c.topic = t;
        c.image = t.image;
        c.roundImage = t.roundImage;
        c.r = t.r;
        if ( t.colour ) c.color = t.colour;
        this.addChild(c);

        c.mass = c.r/50;
        Movement.gravity(c, 0.03);
        Movement.inertia(c);
        Movement.friction(c, 0.96);
        this.bounceOnWalls(c, this.width, this.height);
        this.collider.add(c);
      }

      var spareBubbles = [];
      var N = this.n;
      for ( var i = 0 ; i < N /*&& false*/ ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var c = this.Bubble.create({
          r: 20 + Math.random() * 50,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          z: (this.topics.length + i) * -1,
          borderRatio: 0.1,
          color: colour,
        });

        c.mass = c.r/50;
        Movement.gravity(c, 0.03);
        Movement.inertia(c);
        Movement.friction(c, 0.96);

        spareBubbles.push(c);
      }

      // scale the number of bubbles depending on fps
      var self = this;
      var scaler = this.PerformanceScaler.create({
        items: spareBubbles,
        addFunction: function(c) {
          self.addChild(c);
          self.bounceOnWalls(c, self.width, self.height);
          self.collider.add(c);
        },
        removeFunction: function(c) {
          self.removeChild(c);
          c.cancelBounce_.destroy();
          self.collider.remove(c);
        }
      });


      var tinyBubbles = [];
      for ( var i = 0 ; i < 200 && i < 20 ; i++ ) {
        var b = this.PhysicalGLCircle.create({
          r: 5,
          segments: 16,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          borderRatio: 1.0,
          color: [ 0,0,1,0.2],
          mass: 0.6
        });
        b.addChild(this.GLCircle.create({
          r: b.r,
          segments: 16,
          borderRatio: 0.1,
          color: [ 0,0,1,1.0]
        }));
        b.y$.addListener(function(b) {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }.bind(this, b));

        b.vy = -4;
        Movement.inertia(b);
        Movement.gravity(b, -0.2);
        Movement.friction(b);

        tinyBubbles.push(b);


//        this.view.$.addEventListener('click', this.onClick);
       document.body.addEventListener('click', this.onClick);

      }
      // scale the number of bubbles depending on fps
      var self = this;
      var scaler = this.PerformanceScaler.create({
        items: tinyBubbles,
        addFunction: function(b) {
          self.collider.add(b);
          self.addChild(b);
        },
        removeFunction: function(b) {
          self.collider.remove(b);
          self.removeChild(b);
        }
      });



      var clock = this.ClockView.create({x:this.width-70,y:70, r:60});
      this.addChild(clock);
      // since ClockView doesn't actually react to time, force it to paint
      this.timer.second$.addListener(function() { clock.paint(); });



      this.collider.start();
    },

    function bounceOnWalls(c, w, h) {
      c.cancelBounce_ = Events.dynamic(function() { c.x; c.y; }, function() {
        var r = c.r;
        if ( c.x < r     ) { c.vx += 0.2; c.vy -= 0.19; }
        if ( c.x > w - r ) { c.vx -= 0.2; c.vy += 0.19; }
        if ( c.y < r     ) { c.vy += 0.2; c.vx += 0.19; }
        if ( c.y > h - r ) { c.vy -= 0.2; c.vx -= 0.19; }
      });
    },

    function destroy() {
      this.SUPER();
      this.collider.destroy();
    }
  ]
});
