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
  name: 'PieGraph',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name:  'r',
      view:  'foam.ui.IntFieldView',
      defaultValue: 50,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.setDimensions();
      }
    },
    {
      name:  'lineColor',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'lineWidth',
      defaultValue: 1,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.setDimensions();
      }
    },
    {
      name: 'colorMap',
      defaultValue: undefined
    },
    {
      name:  'data',
      // type:  'Array[float]',
      factory: function() { return []; }
    },
    {
      name: 'groups',
      label: 'Group Data',
      defaultValue: { }
    },
    {
      type: 'Function',
      name: 'toColor',
      defaultValue: function(key, i, n) {
        return this.colorMap && this.colorMap[key] || this.toHSLColor(i, n);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.setDimensions();
    },
    setDimensions: function() {
      this.width = this.height = this.getDimensions();
    },
    getDimensions: function() {
      return 2 * (this.r + this.lineWidth);
    },
    toCount: function(o) {
      return CountExpr.isInstance(o) ? o.count : o;
    },
    toHSLColor: function(i, n) {
      return 'hsl(' + Math.floor(360*i/n) + ', 95%, 75%)';
    },
    paintSelf: function(c) {
      if ( ! c ) return;

      var x = this.x;
      var y = this.y;
      var r = this.r;

      var sum = 0;
      var n = 0;
      for ( var key in this.groups ) {
        sum += this.toCount(this.groups[key]);
        n++;
      }

      // Drop shadown
      if ( r > 10 ) {
        c.fillStyle = 'lightgray';
        c.beginPath();
        c.arc(r+2, r+2, r, 0, 2 * Math.PI);
        c.fill();
      }

      c.lineWidth = this.lineWidth;
      c.strokeStyle = this.lineColor;

      var rads = 0;
      var i = 0;
      for ( var key in this.groups ) {
        var start = rads;
        var count = this.toCount(this.groups[key]);
        rads += count / sum * 2 * Math.PI;
        c.fillStyle = this.toColor(key, i++, n);
        c.beginPath();
        if ( count < sum ) c.moveTo(r,r);
        c.arc(r, r, r, start, rads);
        if ( count < sum ) c.lineTo(r,r);
        c.fill();
        c.stroke();
      }

      /*
        var grad = c.createLinearGradient(0, 0, r*2, r*2);
        grad.addColorStop(  0, 'rgba(0,0,0,0.1)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0)');
        grad.addColorStop(  1, 'rgba(255,255,255,0.2)');
        c.fillStyle = grad;
        c.arc(r+2, r+2, r, 0, 2 * Math.PI);
        c.fill();
      */
    }
  }
});
