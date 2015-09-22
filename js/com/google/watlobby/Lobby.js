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

      var foam = this.ImageCView.create({x: 10, y: this.height-60, width: 837/5, height: 269/5, src: 'img/foampowered_red.png'});
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
