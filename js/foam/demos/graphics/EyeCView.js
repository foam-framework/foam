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
  extends: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'red'
    },
    {
      name:  'pupilColor',
      type:  'String',
      defaultValue: 'black'
    },
    {
      type: 'Float',
      name:  'r',
      label: 'Radius',
      defaultValue: 50
    },
    {
      name:  'lid',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r});
      }
    },
    {
      name:  'white',
      paint: true,
      factory: function() {
        return this.Circle.create({r: this.r*0.8, color: 'white'});
      }
    },
    {
      name:  'pupil',
      paint: true,
      lazyFactory: function() {
        return this.Circle.create({r: this.r / 5});
      }
    },
    { name: 'x',      defaultValueFn: function() { return 2 * this.r; } },
    { name: 'y',      defaultValueFn: function() { return ( 2 * this.r ) * 1.3; } },
    { name: 'width',  defaultValue: 80 },
    { name: 'height', defaultValue: 100 },
    { name: 'a',      defaultValue: -Math.PI/40 }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.lid);
      this.addChild(this.white);
      this.addChild(this.pupil);
    },
    watch: function(target) { this.target_ = target; },
    paintSelf: function(canvas) {
      this.pupil.color = this.pupilColor;
      this.lid.color = this.color;

      // point pupil towards target
      if ( this.target_ ) {
        var dx = this.pupil.canvasX - this.target_.canvasX;
        var dy = this.pupil.canvasY - this.target_.canvasY;
        var theta = Math.atan2(dy,dx);
        var r     = Math.min(this.r, Math.sqrt(dx*dx+dy*dy));
        var newX = -r * 0.6 * Math.cos(-theta);
        var newY =  r * 0.6 * Math.sin(-theta);
        // Don't bother moving the pupil only a small distance to avoid eye
        // jittering.
        if ( Movement.distance(this.pupil.x - newX, this.pupil.y - newY) > 2 ) {
          this.pupil.x = newX;
          this.pupil.y = newY;
        }
      }

      canvas.scale(1.0, 1.3);
    }
  }
});
