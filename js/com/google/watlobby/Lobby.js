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
    {
      name: 'topic'
    },
    {
      name: 'image'
    },
    {
      name: 'colour'
    },
    {
      name: 'r'
    }
  ]
});


CLASS({
  package: 'com.google.watlobby',
  name: 'Bubble',

  extendsModel: 'foam.demos.physics.PhysicalCircle',

  properties: [
    {
      name: 'topic'
    },
    {
      name: 'image'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

    }
  }
});


CLASS({
  package: 'com.google.watlobby',
  name: 'Lobby',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'com.google.watlobby.Bubble',
    'foam.demos.physics.PhysicalCircle',
    'foam.physics.Collider',
    'foam.demos.ClockView',
    'foam.util.Timer'
  ],

  imports: [ 'timer' ],

  constants: {
    COLOURS: ['#33f','#f00','#fc0', '#3c0']
  },

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 30 },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      return this.Collider.create();
    }},
    {
      name: 'topics',   factory: function() {
      return JSONUtil.arrayToObjArray(this.X, [
        { topic: 'chrome',       image: 'chrome.png',       r: 100 },
        { topic: 'googlecanada', image: 'googlecanada.png', r: 100 },
        { topic: 'inbox',        image: 'inbox.png',        r: 100 },
        { topic: 'gmailoffline', image: 'gmailoffline.jpg', r: 100 },
        { topic: 'fiber',        image: 'fiber.jpg',        r: 100 },
      ], this.Topic);
    }}
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      var N = this.n;
      for ( var i = 0 ; i < N ; i++ ) {
        var colour = this.COLOURS[i % this.COLOURS.length];
        var c = this.Bubble.create({
          r: 20 + Math.random() * 50,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          borderWidth: 6,
          color: '#eee',
          border: colour
        });
        if ( i < this.topics.length ) {
          var t = this.topics[i];
//          c.copyFrom(t);
          c.topic = t;
          c.r = t.r;
          if ( t.colour ) c.border = t.colour;
        }
        this.addChild(c);

        c.y$.addListener(function(c) {
          if ( c.y > 1/this.scaleY*this.height+50 ) {
            c.y = -50;
          }
        }.bind(this, c));

        Movement.gravity(c, 0.03);
        Movement.inertia(c);
        Movement.friction(c, 0.96);
        this.bounceOnWalls(c, this.width, this.height);
        this.collider.add(c);
      }

      for ( var i = 0 ; i < 200 ; i++ ) {
        var b = this.PhysicalCircle.create({
          r: 4,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          color: 'rgba(50,50,255,0.1)',
          borderWidth: 0.5,
          border: 'blue',
          mass: 0.5
        });

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
        this.collider.add(b);

        this.addChild(b);
      }

      var clock = this.ClockView.create({x:this.width-70,y:70, r:60});
      this.addChild(clock);

      this.collider.start();
    },

    bounceOnWalls: function (c, w, h) {
      Events.dynamic(function() { c.x; c.y; }, function() {
        var r = c.r + c.borderWidth;
        if ( c.x < r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - r ) c.vx = -Math.abs(c.vx);
      });
    },

    destroy: function() {
      this.SUPER();
      this.collider.destroy();
    }
  }
});
