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
  package: 'foam.graphics',
  name: 'Polygon',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'r',
      label: 'Radius',
      type: 'int',
      defaultValue: 20
    },
    {
      name: 'sides',
      defaultValue: 5
    },
    {
      name: 'width',
      defaultValueFn: function() { return 2*this.r; }
    },
    {
      name: 'height',
      defaultValueFn: function() { return 2*this.r; }
    }
  ],

  methods: [
    function paintSelf(c) {
      if ( ! c ) return;
      if ( ! this.r ) return;

      var a = Math.PI*2/this.sides;
      c.lineWidth = this.borderWidth;

      c.fillStyle = this.color;
      c.beginPath();
      c.moveTo(this.r, 0);
      for ( var i = 0 ; i < this.sides ; i++ ) {
        c.lineTo(this.r*Math.cos(i*a), this.r*Math.sin(i*a));
      }
      c.closePath();

      if ( this.border ) {
        c.strokeStyle = this.border;
        c.stroke();
      }
      if ( this.color ) c.fill();
    },
    function intersects(c) {
      var r = this.r + c.r;
      if ( this.border ) r += this.borderWidth;
      if ( c.border    ) r += c.borderWidth;
      return Movement.distance(this.x-c.x, this.y-c.y) < r;
    }
  ]
});
