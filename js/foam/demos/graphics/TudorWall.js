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
  package: 'foam.demos.graphics',
  name: 'TudorWall',
  extends: 'foam.graphics.SimpleRectangle', // TODO: Make be CView

  requires: [ 'foam.util.Timer' ],
  exports:  [ 'timer', 'cellSize', 'nx' ],

  documentation: "Reproduction of Ana Tudor's demo at: http://codepen.io/thebabydino/pen/Qjejog/",

  models: [
    {
      name: 'Cell',
      extends: 'foam.graphics.SimpleRectangle',
      imports: [ 'timer', 'cellSize', 'nx' ],
      constants: { FILL_RATIO: 0.64 },
      properties: [
        'row',
        'col',
        { name: 'lPhase', factory: function() { return Math.random() * Math.PI * 2; } }
      ],
      methods: [
        function initCView() {
          this.x = 4 + this.cellSize * this.col;
          this.y = 4 + this.cellSize * this.row;
          this.width = this.height = this.FILL_RATIO * this.cellSize;
          this.timer.time$.addListener(this.onTick);
        },
        function paintSelf(c) {
          c.shadowColor = this.background;
	  c.shadowBlur  = 5;
          this.SUPER(c);
        }
      ],
      listeners: [
        function onTick() {
          var hue = ( this.col/this.nx*360 + this.timer.time/3 ) % 360;
          var l   = 40 - 30*Math.cbrt(Math.sin(this.lPhase + this.timer.time/200));
	  this.background = 'hsl(' + hue + ',100%,' + l + '%)';
        }
      ]
    }
  ],

  properties: [
    [ 'nx', 25 ],
    [ 'ny', 13 ],
    [ 'cellSize', 20 ],
    [ 'background', 'black' ], // TODO: Why doesn't this work?
    { name: 'timer', factory: function() { return this.Timer.create({isStarted: true}); } }
  ],

  methods: [
    function initCView() {
      this.width  = 5000; //this.nx * this.cellSize;
      this.height = 5000; //this.ny * this.cellSize;
      this.background = 'black';

      for ( var i = 0 ; i < this.nx ; i++ )
	for ( var j = 0 ; j < this.ny ; j++ )
	  this.addChild(this.Cell.create({row: j, col: i}));
    }
  ]
});
