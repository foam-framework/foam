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
  extendsModel: 'foam.graphics.Circle'
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Snake',
  extendsModel: 'foam.graphics.CView',
  requires: [ 'foam.demos.supersnake.Scale' ],

  imports: [ 'timer' ],
  constants: { R: 20 },

  properties: [
//    { name: 'scales', factory: function() { return []; } },
    { name: 'sx', defaultValue: 250 },
    { name: 'sy', defaultValue: 250 },
    { name: 'vx', defaultValue: 1 },
    { name: 'vy', defaultValue: 0 },
    { name: 'length', defaultValue: 5 }
  ],
  methods: [
    function init() {
      this.SUPER();
      
      this.timer.i$.addListener(this.tick);
    },
    function up()    { this.vy = -1; this.vx =  0; },
    function down()  { this.vy =  1; this.vx =  0; },
    function left()  { this.vy =  0; this.vx = -1; },
    function right() { this.vy =  0; this.vx =  1; }
  ],
  listeners: [
    {
      name: 'tick',
      isMerged: 150,
      code: function() {
        this.sx += this.vx * 2*this.R;
        this.sy += this.vy * 2*this.R;
        if ( this.children.length )
          this.children[this.children.length-1].color = 'green';
        this.addChild(this.Scale.create({x: this.sx, y: this.sy, radius: this.R, color: 'red'}));
        if ( this.children.length > this.length ) {
          this.children.shift();
        }
      }
    }
  ]
});


CLASS({
  package: 'foam.demos.supersnake',
  name: 'Game',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.util.Timer',
    'foam.demos.supersnake.Snake',
    'foam.graphics.CView',
    'foam.graphics.Rectangle',
    'foam.physics.Collider'
  ],

  exports: [
    'timer'
  ],

  properties: [
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      name: 'width',
      defaultValue: 1600
    },
    {
      name: 'height',
      defaultValue: 800
    },
    {
      name: 'snake',
      factory: function() { return this.Snake.create(); }
    },
    {
      name: 'table',
      factory: function() {
        return this.CView.create({background: 'lightblue', width: this.width, height: this.height}).addChildren(
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
      code: function() {
      }
    }
  ],

  actions: [
    {
      name: 'up',
      keyboardShortcuts: [ 38 /* up arrow */, 'w' ],
      action: function() { this.snake.up(); }
    },
    {
      name: 'down',
      keyboardShortcuts: [ 40 /* down arrow */, 's' ],
      action: function() { this.snake.down(); }
    },
    {
      name: 'left',
      keyboardShortcuts: [ 'a' ],
      action: function() { this.snake.left(); }
    },
    {
      name: 'right',
      keyboardShortcuts: [ 'd' ],
      action: function() { this.snake.right(); }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">%%table</div>
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

//      this.addChild(this.collider);

      this.timer.i$.addListener(this.tick);
      this.timer.start();

      // Setup Physics
      // this.collider.add(this.ball, this.lPaddle, this.rPaddle).start();
      // Movement.inertia(this.ball);
    }
  }
});
