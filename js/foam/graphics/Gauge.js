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
  name: 'Gauge',

  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'label',
      help: 'The label to appear on the meter.',
    },
    {
      type: 'Float',
      name: 'data',
      postSet: function(o, n) { if ( this.view ) this.view.paint(); },
      defaultValue: 1
    },
    {
      type: 'Float',
      name:  'maxValue',
      label: 'Max. Value',
      help: 'Maximum Value.',
      defaultValue: 10
    },
    {
      name: 'width',
      defaultValue: 280
    },
    {
      name: 'height',
      defaultValue: 180
    }
  ],

  methods: {
    /*
    toHTML: function() {
      this.canvasView = Canvas.create({background:'rgba(0,0,0,0)',width:this.width+4, height:this.height+4});
      this.canvasView.addChild(this);
      return this.canvasView.toHTML();
    },
    */

    /*
    link: function(powerInfo) {
      Events.follow(powerInfo.propertyValue('watts'), this.propertyValue('value'));
    },
    */

    rotateToValue: function(c, x, y, value) {
      var a = value / this.maxValue * (3.0*Math.PI/5.0)-1.5*Math.PI/5.0;

      c.save();

      c.translate(x,y);
      c.rotate(a);
      c.translate(-x,-y);
    },

    paintSelf: function(c) {
      var width  = this.width - 4;
      var height = this.height - 4;
      var r = height-30;
      var x = width/2+1;
      var y = height-8;

      c.shadowOffsetX = 0;
      c.shadowOffsetY = 0;
      c.shadowBlur = 0;

      c.fillStyle = "black";
      c.fillRect(0,0,width+10,height+10);
      c.fillStyle = "white";
      c.fillRect(2,2,width,height);

      c.strokeStyle = 'black';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x, y, r, -Math.PI/5.0, -4.0*Math.PI/5.0, true);
      c.stroke();

      c.fillStyle = 'black';
      c.textAlign = 'center';
      c.font = '16pt sans-serif';
      c.fillText(this.label, x, y-30,60);

      this.rotateToValue(c, x,y,this.data);

      c.lineWidth = 1;
      c.shadowOffsetX = 2;
      c.shadowOffsetY = 2;
      c.shadowBlur = 1;
      c.shadowColor = "gray";

      c.beginPath();
      c.moveTo(width/2+1, height-10);
      c.lineTo(width/2+1, height+5-r);
      c.stroke();

      c.fillStyle='white';
      c.fillRect(width/2+1, height-10, 1, -r+15);
      c.strokeStyle = 'red';
      c.beginPath();
      c.moveTo(width/2+1, height+5-r);
      c.lineTo(width/2+1, height-20-r);
      c.stroke();
      c.fillStyle='white';
      c.fillRect(width/2+1, height+5-r, 1, -30);
      c.restore();

      for ( var i = 0 ; i <= this.maxValue ; i++ ) {
        this.rotateToValue(c, x,y,i);

        c.fillStyle = 'black';
        c.textAlign = 'center';
        c.font = "10pt sans-serif";
        c.fillText(i, x, y-r-5);

        c.beginPath();
        c.moveTo(x, y-r);
        c.lineTo(x, y-r-4);
        c.stroke();

        c.restore();
      }

      for ( var i = 0 ; i < this.maxValue ; i++ ) {
        this.rotateToValue(c, x,y,i+0.5);

        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y-r);
        c.lineTo(x, y-r-3);
        c.stroke();

        c.restore();
      }
    }
  }
});
