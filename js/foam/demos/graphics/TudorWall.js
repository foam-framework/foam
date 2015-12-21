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
  extends: 'foam.graphics.CView',

  requires: [ 'foam.util.Timer' ],
  exports:  [ 'timer', 'cellSize', 'nx' ],

  documentation: "Ported from Ana Tudor's demo at: http://codepen.io/thebabydino/pen/Qjejog/",

  models: [
    {
      name: 'Cell',
      extends: 'foam.graphics.SimpleRectangle',
      imports: [ 'timer', 'dynamic', 'cellSize', 'nx' ],
      properties: [
        'row',
        'col',
        {
          name: 'lPhase',
          factory: function() { return Math.random() * Math.PI * 2; }
        }
      ],
      methods: [
        function initCView() {
          this.x = this.cellSize * this.col+4;
          this.y = this.cellSize * this.row+4;
          this.width = this.height = 0.64 * this.cellSize;

          this.timer.time$.addListener(function() {
            var t   = Math.PI * 2 * this.timer.time/1000.0;
            var hue = (this.col/this.nx*360 + this.timer.time/3)%360;
            var l   = 40 - 30*Math.cbrt(Math.sin(this.lPhase + t/2));
	    this.background = 'hsl(' + hue + ',100%,' + l + '%)';
          }.bind(this));
        },
        function paintSelf(c) {
          c.shadowColor = this.background;
	  c.shadowBlur  = 5;
          this.SUPER(c);
        }
      ]
    }
  ],

  properties: [
    [ 'nx', 40 ],
    [ 'ny', 30 ],
    [ 'cellSize', 24 ],
    [ 'background', 'black' ],
    {
      name: 'timer',
      factory: function() { return this.Timer.create(); }
    },
    {
      name:  'r',
      defaultValue: 300,
      postSet: function(_, r) { this.width = this.height = 2*r + 100; }
    }
  ],

  methods: [
    function initCView() {
      this.width  = this.nx * this.cellSize;
      this.height = this.ny * this.cellSize;

      for ( var i = 0 ; i < this.nx ; i++ )
	for ( var j = 0 ; j < this.ny ; j++ )
          // TODO: this.Y shouldn't be required
	  this.addChild(this.Cell.create({row: j, col: i}, this.Y));

      this.timer.start();
    },
    function paintSelf(c) {
      // TODO: Why is this needed?
      this.background = 'black';
      this.erase(c);
    }
  ]
});
