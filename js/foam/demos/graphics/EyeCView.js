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
  name:  'EyeCView',
  label: 'Eye',

  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'red'
    },
    {
      model_: 'IntProperty',
      name:  'r',
      label: 'Radius',
      defaultValue: 50
    },
    {
      name:  'lid',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r, color: this.color});
      }
    },
    {
      name:  'white',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r*0.8, color: 'white'});
      }
    },
    {
      name:  'pupil',
      type:  'Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r / 5, color: 'black'});
      }
    },
    { name: 'x',      defaultValueFn: function() { return 2 * this.r; } },
    { name: 'y',      defaultValueFn: function() { return ( 2 * this.r ) * 1.3; } },
    { name: 'width',  defaultValue: 150 },
    { name: 'height', defaultValue: 150 },
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.lid);
      this.addChild(this.white);
      this.addChild(this.pupil);
    },
    watch: function(target) { this.target_ = target; },
    paintSelf: function() {
      // point pupil towards target
      if ( this.target_ ) {
        var t = this.target_.mapToCanvas({x: this.target_.x, y: this.target_.y});
        var o = this.mapToCanvas({x: this.x, y: this.y});
        var dx = o.x - t.x;
        var dy = o.y - t.y;
        var theta = Math.atan2(dy,dx);
        var r     = Math.sqrt(dx*dx+dy*dy);
        this.pupil.x = -this.r * 0.63 * Math.cos(-theta);
        this.pupil.y = this.r * 0.63 * Math.sin(-theta);
      }

      this.canvas.translate(this.x, this.y);
      this.canvas.rotate(-Math.PI/40);
      this.canvas.scale(1.0, 1.3);
      this.canvas.translate(-this.x,-this.y);
    }
  }
});
