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
  name:  'Turntable',

  extends: 'foam.graphics.CView',

  properties: [
    {
      type: 'Int',
      name:  'r',
      label: 'Radius',
      defaultValue: 150
    },
    {
      name:  'width',
      defaultValue: 350
    },
    {
      name:  'height',
      defaultValue: 350
    },
    {
      name:  'x',
      defaultValue: 10
    },
    {
      name:  'y',
      defaultValue: 10
    },
    {
      type: 'Float',
      name:  'rpm',
      label: 'RPM',
      help:  'Rotations Per Minute. Standard values: 33, 45, and 78.',
      defaultValue: 33
    },
    {
      name:  'internalTime',
      postSet: function(_, newValue) { if ( this.active ) this.time = newValue; }
    },
    {
      name:  'time',
      preSet: function(_, newValue) {
        if ( this.view ) this.view.paint();

        // When active, don't accept external changes to time.  Override by firing event back to
        // internalTime value.
        if ( this.active ) {
          if ( newValue != this.internalTime ) this.propertyChange('time', newValue, this.internalTime);
          return this.internalTime;
        }

        return newValue;
      }
    }
  ],

  listeners: [
    function mouseDown(evt) {
      this.active = true;
      this.internalTime = this.time;
      this.touchX = evt.offsetX - this.r - this.x;
      this.touchY = evt.offsetY - this.r - this.y;
      this.theta = this.angle(this.touchX, this.touchY);
    },
    function mouseUp(evt) {
      this.active = false;
    },
    function mouseMove(evt) {
      if ( ! this.active ) return;

      this.touchX = evt.offsetX - this.r - this.x;
      this.touchY = evt.offsetY - this.r - this.y;

      var prevA = this.theta;
      this.theta = this.angle(this.touchX, this.touchY);
      var d = this.theta - prevA;
      if ( d > Math.PI*1.5 ) d -= Math.PI*2;
      if ( d < -Math.PI*1.5 ) d += Math.PI*2;
      if ( d == 0 ) return;

      var dTime = d/(Math.PI*2)*36000/this.rpm;
      this.time = this.internalTime = this.internalTime + dTime;
    }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      this.r = this.r;

      this.$.onmousedown = this.mouseDown;
      this.$.onmouseup   = this.mouseUp;
      this.$.onmousemove = this.mouseMove;
    },

    angle: function(x,y) {
      return Math.atan2(y-this.y, x-this.x);
    },

    paintSelf: function(c) {
      c.save();
      c.translate(this.r, this.r);
      c.font = "48pt Arial";

      c.lineWidth = 12;
      c.globalAlpha = 0.25;

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,this.r-12,0,Math.PI*2,true);
      c.stroke();

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,5+(this.r-12)/2,0,Math.PI*2,true);
      c.stroke();

      var r4 = (this.r-10)/4;
      var p = -0.25*this.rpm*this.time/36000*Math.PI*2;
      c.beginPath();
      c.strokeStyle = 'black';
      c.arc(this.x+(10+r4)*Math.sin(p),this.y+(10+r4)*Math.cos(p),r4,0,Math.PI*2,true);
      c.stroke();

      var p = -this.rpm*this.time/36000*Math.PI*2;
      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x+(10+3*r4)*Math.sin(p),this.y+(10+3*r4)*Math.cos(p),r4,0,Math.PI*2,true);
      c.stroke();

      /*
      c.save();
      c.translate(this.x,this.y);
      c.rotate(this.rpm*this.time/36000*Math.PI*2);
      c.translate(-this.x,-this.y);
      c.fillStyle = '#999';
      c.fillText("FOAM", this.x-92, this.y+25);
      c.restore();
      */

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,8,0,Math.PI*2,true);
      c.stroke();

      if ( this.active ) {
        c.lineWidth = 15;
        c.strokeStyle = 'blue';
        c.beginPath();
        c.arc(this.touchX,this.touchY,r4,0,Math.PI*2,true);
        c.stroke();

        c.lineWidth = 3;
        var dx = this.touchX - this.x;
        var dy = this.touchY - this.y;
        var r  = Math.sqrt(dx*dx + dy*dy);
        var a = Math.atan2(dy, dx);

        r = Math.round(r / 20) * 20;
        c.beginPath();
        c.strokeStyle = 'blue';
        c.arc(this.x,this.y,r,a+Math.PI*0.8,a-Math.PI*0.8,true);
        c.stroke();
      }

      c.restore();
    }
  }
});
