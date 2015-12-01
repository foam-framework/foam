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

  extends: 'foam.demos.physics.PhysicalGLCircle',

  requires: [
    'foam.graphics.webgl.flat.Image',
    'foam.graphics.webgl.primitives.Circle'
  ],

  imports: [ 'lobby' ],

  properties: [
    { name: 'topic' },
    {
       name: 'image',
       postSet: function() {
         if ( this.image ) {
           var img = this.Image.create({src: this.image, z: -0.5});
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

      this.dynamicLOD = 8;

      this.background = this.Circle.create({ r$: this.r$, segments$: this.segments$, color: [1,1,1,1], z: -0.9});
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

  extends: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.webgl.flat.Image',
    'foam.graphics.webgl.primitives.Rectangle',
    'foam.graphics.ViewCView',
    'com.google.watlobby.Bubble',
    'foam.graphics.webgl.flat.Video'
  ],

  properties: [
    {
      name: 'video',
      defaultValue: '1Bb29KxXzDs'
    },
    {
      name: 'playIcon',
      factory: function() { return this.Image.create({src: 'play.png', x:-40, y:-40, width: 80, height: 80, alpha: 0.25}); }
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
        var vw = w * 0.9;
        var vh = vw * 9/16

        var v = this.Video.create({
          x: this.x, y: this.y, z: 800, width: 0, height: 0, axis: [1,1,1],
          src:"Google in Waterloo Region - Ontario  Canada.mp4",
          translucent: true,
          shapeName: 'flatUnitRectangle'
        });

        Movement.animate(4000, function(i, j) {
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

  extends: 'com.google.watlobby.Bubble',

  requires: [
    'foam.graphics.webgl.primitives.Rectangle',
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
  package: 'com.google.watlobby.orphanage',
  name: 'LobbyGL',
  extends: 'foam.graphics.webgl.flat.Scene',

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.PhotoAlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.ClockView',
    'foam.demos.physics.PhysicalCircle',
    'foam.demos.physics.PhysicalGLCircle',
    'foam.demos.physics.PhysicalGLSphere',
    'foam.physics.PhysicsEngine as Collider',
    'foam.util.Timer',
    'foam.graphics.webgl.primitives.Circle as GLCircle',
    'foam.graphics.Circle',
    'foam.graphics.webgl.PerformanceScaler',
    'foam.graphics.CView',
    'foam.graphics.webgl.CViewGLView',
  ],

  imports: [ 'timer' ],
  exports: [ 'as lobby' ],

  constants: {
    COLOURS: [[0.19, 0.19, 1.0, 1.00],[1.0, 0.0, 0.0, 1.00],[1.0, 0.75, 0.0, 1.00], [0.19, 0.75, 0.0, 1.00]]
  },

  properties: [
    { name: 'classname',  defaultValue: 'lobbyCanvas' },
    { name: 'targetFps',  defaultValue: 50 },
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
            if ( c1.y < r     ) { c1.vy += 0.2; c1.vx += 0.19; }
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
        { topic: 'flip',         image: 'flip.jpg',         r: 100, colour: [1.0, 0.0, 0.0, 1.00] },
        { topic: 'chrome',       image: 'chrome.png',       r: 180, roundImage: true, colour: [1.0, 0.0, 0.0, 1.00] },
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
    }},
//     {
//       name: 'backgroundLayer',
//       factory: function() {
//         return this.CView.create({ width$: this.width$, height$: this.height$ });
//       }
//     }
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

      var bubbleScale = this.width / 1920;

//      this.cameraDistance = -6.0;

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      for ( var i = 0 ; i < this.topics.length ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var t = this.topics[i];
        var c = this.X.lookup(t.model).create({
          r: (20 + Math.random() * 50) * bubbleScale,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          z: -i*16 * bubbleScale,
          color: colour,
          axis: [1,1,1]
        }, this.Y);
        c.topic = t;
        c.image = t.image;
        c.roundImage = t.roundImage;
        c.r = t.r * bubbleScale;
        if ( t.colour ) c.color = t.colour;
        this.addChild(c);

        c.mass = c.r/50;
        c.gravity = 0.03 * bubbleScale;
        c.friction = 0.96;
        //this.bounceOnWalls(c, this.width, this.height);
        this.collider.add(c);
      }

      var spareBubbles = [];
      var N = this.n;
      for ( var i = 0 ; i < N ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var c = this.Bubble.create({
          r: (20 + Math.random() * 50) * bubbleScale,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          z: (this.topics.length + i) * -16 * bubbleScale,
          borderRatio: 0.1,
          color: colour,
        });

        c.mass = c.r/20 ;
        c.gravity = 0.03 * bubbleScale;
        c.friction = 0.96;

        spareBubbles.push(c);
//         this.addChild(c);
//         this.bounceOnWalls(c, this.width, this.height);
//         this.collider.add(c);


      }

      //scale the number of bubbles depending on fps
      var scene = this;
      var scaler = this.PerformanceScaler.create({
        items: spareBubbles,
        addFunction: function(c) {
          scene.addChild(c);
          //scene.bounceOnWalls(c, scene.width, scene.height);
          scene.collider.add(c);
          c.x = Math.random() * scene.width;
          c.y = -200;
        },
        removeFunction: function(c) {
          scene.removeChild(c);
          //c.cancelBounce_.destroy();
          scene.collider.remove(c);
        }
      });


      var tinyBubbles = [];
      for ( var i = 0 ; i < 200; i++ ) {
        var b = this.PhysicalCircle.create({
          r: 5 * bubbleScale,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          borderWidth: 0.5,
          color: 'rgba(0,0,255,0.5)',
          border: '#blue',
          mass: 0.6 * bubbleScale
        });
        b.y$.addListener(function(b) {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }.bind(this, b));

        b.vy = -4;
        b.gravity = -0.4 * bubbleScale;
        b.friction = 0.95;

        tinyBubbles.push(b);


//        this.view.$.addEventListener('click', this.onClick);
      }
      // scale the number of bubbles depending on fps
      var self = this;
      var scaler2 = this.PerformanceScaler.create({
        items: tinyBubbles,
        addFunction: function(b) {
          b.x = Math.random() * self.width;
          b.y = self.height + 200;
          self.collider.add(b);
          self.addChild(b);
        },
        removeFunction: function(b) {
          self.collider.remove(b);
          self.removeChild(b);
        }
      });

     document.body.addEventListener('click', this.onClick);
     //this.backgroundLayer.write(this.X);

      var clock = this.ClockView.create({x:this.width-70,y:70, r:60});
      this.addChild(clock);
      // since ClockView doesn't actually react to time, force it to paint
      this.timer.second$.addListener(function() { clock.paint(); });



      this.collider.start();
    },

//     function toView_() { /* Internal. Creates a CViewView wrapper. */
//       if ( ! this.view ) {
//         var params = { cview: this };
//         if ( this.className )   params.className   = this.className;
//         if ( this.tooltip )     params.tooltip     = this.tooltip;
//         if ( this.speechLabel ) params.speechLabel = this.speechLabel;
//         if ( this.tabIndex )    params.tabIndex    = this.tabIndex;
//         if ( this.role )        params.role        = this.role;
//         if ( this.data$ )       params.data$       = this.data$;

//         var outer = this;
//         this.view = {
//           __proto__: outer.GLCViewView.create(params),
//           initHTML: function() {
//             this.$.style.position = 'fixed';
//             return outer.GLCViewView.getPrototype().initHTML.call(this);
//           }
//         };
//       }
//       return this.view;
//     },

//     function bounceOnWalls(c, w, h) {
//       c.cancelBounce_ = Events.dynamicFn(function() { c.x; c.y; }, function() {
//         var r = c.r;
//         if ( c.x < r     ) { c.vx += 0.2; c.vy -= 0.19; }
//         if ( c.x > w - r ) { c.vx -= 0.2; c.vy += 0.19; }
//         if ( c.y < r     ) { c.vy += 0.2; c.vx += 0.19; }
//         if ( c.y > h - r ) { c.vy -= 0.2; c.vx -= 0.19; }
//       });
//     },

    function destroy() {
      this.SUPER();
      this.collider.destroy();
    }
  ]
});
