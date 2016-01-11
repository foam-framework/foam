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
  package: 'foam.demos.pong',
  name: 'Ball',
  extends: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical', 'foam.graphics.MotionBlur'],
  properties: [
    {
      name: 'vx',
      preSet: function(_, v) { return Math.sign(v) * Math.max(5, Math.abs(v)); }
    }
  ]
});


CLASS({
  package: 'foam.demos.pong',
  name: 'Paddle',
  extends: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical', 'foam.graphics.Shadow'],
  properties: [
    [ 'color', 'white' ],
    [ 'r', 30 ],
    { name: 'mass',  factory: function() { return this.INFINITE_MASS; } }
  ]
});


CLASS({
  package: 'foam.demos.pong',
  name: 'Pong',
  extends: 'foam.ui.View',

  requires: [
    'foam.demos.pong.Ball',
    'foam.demos.pong.Paddle',
    'foam.graphics.CView',
    'foam.graphics.Rectangle',
    'foam.physics.Collider'
  ],

  constants: {
    PADDLE_SPEED: 10
  },

  properties: [
    [ 'width',  800 ],
    [ 'height', 300 ],
    {
      name: 'ball',
      view: 'foam.ui.DetailView',
      factory: function() { return this.Ball.create({color: 'white', r: 20}); }
    },
    {
      name: 'lPaddle',
      view: 'foam.ui.DetailView',
      factory: function() { return this.Paddle.create(); }
    },
    {
      name: 'rPaddle',
      view: 'foam.ui.DetailView',
      factory: function() { return this.Paddle.create(); }
    },
    {
      name: 'table',
      factory: function() {
        return this.CView.create({background: 'lightgray', width: this.width, height: this.height}).addChildren(
          this.Rectangle.create({x: this.width/2-5, width:10, height: this.height, border:'rgba(0,0,0,0)' , background: 'white'}),
          this.ball,
          this.lPaddle,
          this.rPaddle);
      }
    },
    {
      type: 'Int',
      name: 'lScore'
    },
    {
      type: 'Int',
      name: 'rScore'
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    }
  ],

  listeners: [
    {
      name: 'onBallMove',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) {
          this.destroy();
          throw EventService.UNSUBSCRIBE_EXCEPTION;
        }
        var ball = this.ball;

        if ( ball.velocity >  20 ) ball.velocity =  20;
        if ( ball.velocity < -20 ) ball.velocity = -20;

        // Bounce off of top wall
        if ( ball.y - ball.r <= 0 ) {
          ball.vy = Math.abs(ball.vy);
        }
        // Bounce off of bottom wall
        if ( ball.y + ball.r >= this.height ) {
          ball.vy = -Math.abs(ball.vy);
        }
        // Bounce off of left wall
        if ( ball.x <= 0 ) {
          this.rScore++;
          ball.x = 150;
          ball.vx *= -1;
        }
        // Bounce off of right wall
        if ( ball.x >= this.width ) {
          this.lScore++;
          ball.x = this.width - 150;
          ball.vx *= -1;
        }
        // Reset scores
        if ( this.lScore == 100 || this.rScore == 100 ) {
          this.lScore = this.rScore = 0;
        }
      }
    }
  ],

  actions: [
    {
      name: 'lUp',
      keyboardShortcuts: [ 'q' ],
      code: function() { this.lPaddle.y -= this.PADDLE_SPEED; }
    },
    {
      name: 'lDown',
      keyboardShortcuts: [ 'a' ],
      code: function() { this.lPaddle.y += this.PADDLE_SPEED; }
    },
    {
      name: 'rUp',
      keyboardShortcuts: [ 38 /* up arrow */ ],
      code: function() { this.rPaddle.y -= this.PADDLE_SPEED; }
    },
    {
      name: 'rDown',
      keyboardShortcuts: [ 40 /* down arrow */ ],
      code: function() { this.rPaddle.y += this.PADDLE_SPEED; }
    }
  ],

  templates: [
    function CSS() {/*
      span[name="lScore"] {
        color: white;
        position: relative;
        top: 80;
        left: 300;
        font-family: sans-serif;
        font-size: 70px;
      }
      span[name="rScore"] {
        color: white;
        position: relative;
        top: 80;
        left: 420;
        font-family: sans-serif;
        font-size: 70px;
      }
    */},
    function toHTML() {/*
      <div id="%%id">$$lScore{mode: 'read-only'} $$rScore{mode: 'read-only'} <br> %%table</div>
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.addChild(this.collider);

      // Position Paddles
      this.lPaddle.x = 25+this.lPaddle.r;
      this.rPaddle.x = this.width-25-this.rPaddle.r;
      this.lPaddle.y = this.rPaddle.y = (this.height-this.rPaddle.height)/2;

      // Setup Ball
      this.ball.x  = this.ball.y = 100;
      this.ball.y  = this.rPaddle.y;
      this.ball.vx = this.ball.vy = 10;

      this.ball.x$.addListener(this.onBallMove);

      // Setup Physics
      this.collider.add(this.ball, this.lPaddle, this.rPaddle).start();
      Movement.inertia(this.ball);
    }
  }
});
