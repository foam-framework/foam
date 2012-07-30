/*
 * Copyright 2012 Google Inc. All Rights Reserved.
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

var Turntable = ModelModel.create({

  extendsModel: 'PanelCViewModel',

  name:  'Turntable',
  label: 'Turntable',

  properties: [
    {
      name:  'r',
      label: 'Radius',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 150
    },
    {
      name:  'width',
      label: 'Width',
      type:  'int',
      defaultValue: 350
    },
    {
      name:  'height',
      label: 'Height',
      type:  'int',
      defaultValue: 350
    },
    {
      name:  'x',
      label: 'X',
      type:  'int',
      defaultValue: 170
    },
    {
      name:  'y',
      label: 'Y',
      type:  'int',
      defaultValue: 170
    },
    {
      name:  'rpm',
      label: 'RPM',
      type:  'float',
      view:  'FloatFieldView',
      help:  'Rotations Per Minute. Standard values: 33, 45, and 78.',
      defaultValue: 33
    },
    {
      name:  'internalTime',
      label: 'Internal Time',
      preSet: function(newValue) {
        if ( this.active ) this.time = newValue;
        return newValue;
      }
    },
    {
      name:  'time',
      label: 'Time',
      preSet: function(newValue) {
        setTimeout(function(){
          if ( this.active )
            this.time = this.internalTime;
          else
            this.internalTime = this.time;
        }.bind(this));

        return newValue;
      }
    }
  ],

  listeners: {
    mouseDown: function(evt) {
      this.active = true;
      this.a = this.angle(evt.offsetX, evt.offsetY);
    },
    mouseUp: function(evt) {
      this.active = false;
    },
    mouseMove: function(evt) {
      if ( ! this.active ) return;

      var prevA = this.a;
      this.a = this.angle(evt.offsetX, evt.offsetY);
      var d = this.a - prevA;
      if ( d > Math.PI*1.5 ) d -= Math.PI*2;
      if ( d < -Math.PI*1.5 ) d += Math.PI*2;
      if ( d == 0 ) return;

      var dTime = d/(Math.PI*2)*36000/this.rpm;
      this.internalTime = this.internalTime + dTime;
    }
  },

  methods: {
    angle: function(x,y) {
      return Math.atan2(y-this.y, x-this.x);
    },

    paint: function() {
      this.canvasView.erase();
      this.__super__.paint.call(this);
      // this.__super__.paint.call(this);
      // this.canvasView.erase();

      this.canvasView.element().onmousedown = this.mouseDown;
      this.canvasView.element().onmouseup   = this.mouseUp;
      this.canvasView.element().onmousemove = this.mouseMove;

      var c = this.canvas;

      c.font = "48pt Arial";

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,this.r,0,Math.PI*2,true);
      c.stroke();

      c.save();
      c.translate(this.x,this.y);
      c.rotate(this.rpm*this.time/36000*Math.PI*2);
      c.translate(-this.x,-this.y);
      c.fillStyle = '#999';
      c.fillText("FOAM", this.x-113, this.y+25);
      c.restore();

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,8,0,Math.PI*2,true);
      c.fill();

    }
  }
});

