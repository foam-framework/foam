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
  package: 'foam.demos.supersnake',
  name: 'Scale',
  extends: 'foam.graphics.Circle',
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Snake',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.demos.supersnake.Scale',
    'foam.demos.supersnake.Laser'
  ],
  imports: [
    'game',
    'timer',
    'R'
  ],

  properties: [
//    { name: 'scales', factory: function() { return []; } },
    [ 'sx', 240 ],
    [ 'sy', 240 ],
    [ 'vx', 1 ],
    [ 'vy', 0 ],
    [ 'length', 5 ]
  ],
  methods: [
    function init() {
      this.SUPER();

      this.timer.i$.addListener(this.tick);
    },
    function up()    { this.vy = -1; this.vx =  0; },
    function down()  { this.vy =  1; this.vx =  0; },
    function left()  { this.vy =  0; this.vx = -1; },
    function right() { this.vy =  0; this.vx =  1; },
    function fire () {
      this.Laser.create({x: this.sx, y: this.sy, vx: this.vx, vy: this.vy});
    },
    function intersects(o) {
      if ( ! this.children.length ) return false;
      return this.children[this.children.length-1].intersects(o);
    }
  ],
  listeners: [
    {
      name: 'tick',
      isMerged: 150,
      code: function() {
        this.sx += this.vx * 2 * this.R;
        this.sy += this.vy * 2 * this.R;
        if ( this.children.length )
          this.children[this.children.length-1].color = 'green';
        this.addChild(this.Scale.create({x: this.sx, y: this.sy, radius: this.R, color: 'red'}));
        if ( this.children.length > this.length )
          this.children.shift();
      }
    }
  ]
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Food',
  extends: 'foam.graphics.Circle',
  properties: [
    [ 'color', 'darkblue' ]
  ],
  methods: [
    function init() {
      this.SUPER();

      Movement.animate(15000, function() {
        this.r = 0;
      }.bind(this))();
    }
  ]
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Mushroom',
  extends: 'foam.graphics.Circle',
  requires: [ 'foam.graphics.Rectangle' ],
  imports: [ 'R as r' ],
  properties: [
    [ 'color',    'red' ],
    [ 'endAngle', Math.PI ],
    'stem'
  ],
  methods: [
    function init() {
      this.SUPER();

      this.addChild(this.stem = this.Rectangle.create({
        x: -7.5,
        y: -0.5,
        width: 15,
        height: 20,
        background: 'gray'
      }));
    },
    function explode() {
      this.stem.background = 'red';
      Movement.animate(200, function() {
        this.scaleX = this.scaleY = 30;
        this.alpha = 0;
        this.a = Math.PI * 1.5;
        this.stem.alpha = 0;
      }.bind(this)/*, function() { this.table.removeChild(o2); }.bind(this)*/)();
    }
  ]
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Laser',
  extends: 'foam.graphics.Circle',
  imports: [ 'game' ],
  properties: [
    [ 'color', 'yellow' ],
    [ 'r', 12 ],
    'vx',
    'vy'
  ],
  methods: [
    function init() {
      this.SUPER();

      this.game.addChild(this);
      Movement.animate(5000, function() {
        this.x += 2000 * this.vx;
        this.y += 2000 * this.vy;
      }.bind(this))();
    }
  ]
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Game',
  extends: 'foam.ui.View',

  requires: [
    'foam.util.Timer',
    'foam.demos.supersnake.Robot',
    'foam.demos.supersnake.Laser',
    'foam.demos.supersnake.Snake',
    'foam.demos.supersnake.Mushroom',
    'foam.demos.supersnake.Food',
    'foam.graphics.CView',
    'foam.graphics.Rectangle',
    'foam.physics.Collider'
  ],

  exports: [
    'R',
    'timer',
    'as game'
  ],

  constants: { R: 20 },

  properties: [
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    [ 'width', 1600 ],
    [ 'height', 800 ],
    {
      name: 'snake',
      factory: function() { return this.Snake.create(); }
    },
    {
      name: 'table',
      factory: function() {
        return this.CView.create({background: 'lightblue', width: window.innerWidth, height: window.innerHeight}).addChildren(
          this.snake);
      }
    },
    {
      name: 'collider',
      factory: function() { return this.Collider.create(); }
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function(_, __, ___, t) {
        if ( t % 100 == 0 ) this.addFood();
        if ( Math.random() < 0.02 ) this.addMushroom();
      }
    }
  ],

  actions: [
    {
      name: 'up',
      keyboardShortcuts: [ 38 /* up arrow */, 'w' ],
      code: function() { this.snake.up(); }
    },
    {
      name: 'down',
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
      code: function() { this.snake.down(); }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 37 /* left arrow */, 'a' ],
      code: function() { this.snake.left(); }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 39 /* right arrow */, 'd' ],
      code: function() { this.snake.right(); }
    },
    {
      name: 'fire',
      keyboardShortcuts: [ ' ', 'x' ],
      code: function() { this.snake.fire(); }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">%%table</div>
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

//      this.addChild(this.collider);

      this.timer.i$.addListener(this.tick);
      this.timer.start();

      this.table.addChild(this.Robot.create({x:200, y:200}));

      // Setup Physics
      this.collider.add(this.snake);
      this.collider.collide = function(o1, o2) {
        if ( this.Laser.isInstance(o2) || this.Snake.isInstance(o2) ) {
          var tmp = o1;
          o1 = o2;
          o2 = tmp;
        }
        if ( this.Laser.isInstance(o1) ) {
          if ( this.Mushroom.isInstance(o2) ) {
            o2.explode();
          } else if ( this.Food.isInstance(o2) ) {
          }
        }
        if ( this.Snake.isInstance(o1) && this.Mushroom.isInstance(o2) ) {
          if ( o2.scaleX == 1 )
            this.gameOver();
          else
            this.removeChild(o2);
        }
        if ( this.Snake.isInstance(o1) && this.Food.isInstance(o2) ) {
          this.removeChild(o2);
          this.snake.length++;
        }
//        console.log('BANG', o1, o2);
      }.bind(this);
      this.collider.start();

      window.game = this;
    },

    function gameOver() {
      this.timer.stop();
//      this.collider.stop(); // TODO: add stop() method to collider
      this.table.background='orange';
    },

    function addChild(c) {
      this.table.addChild(c);
      if ( c.intersects ) this.collider.add(c);
    },

    function removeChild(c) {
      this.table.removeChild(c);
      if ( c.intersects ) this.collider.remove(c);
    },

    function addFood() {
      var R = this.R;
      var f = this.Food.create({
        x: Math.round(1+Math.random()*(this.table.width -4*R)/R)*2*R,
        y: Math.round(1+Math.random()*(this.table.height-4*R)/R)*2*R,
      });
      this.addChild(f);
    },

    function addMushroom() {
      var R = this.R;
      var m = this.Mushroom.create({
        x: Math.round(1+Math.random()*(this.table.width -4*R)/R)*2*R,
        y: Math.round(1+Math.random()*(this.table.height-4*R)/R)*2*R,
        scaleX: 0.1,
        scaleY: 0.1});

      Movement.animate(7000, function() {
        m.scaleX = m.scaleY = 1;
      })();

      this.addChild(m);
    }
  ]
});
