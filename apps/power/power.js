/**
 * @license
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
// todo: slider controls for gpu/cpu/etc.

var ApplicationPower = Model.create({

   name: 'AppPowerInfo',
   label: 'Application Power Information',

    tableProperties: [
      'name',
       'active',
      'state'
    ],

   properties: [
      {
         name:  'name',
         label: 'Application Name',
         type:  'String',
         help:  'The name of the application.',
         defaultValue: ""
      },
      {
         name: 'active',
         type: 'Boolean',
         view: 'foam.ui.BooleanView',
         defaultValue: false,
         help: 'Indicates if currently active.'
      },
      {
         name: 'state',
         type: 'String',
         // todo: curry arguments
         view: {
           factory_: 'foam.ui.ChoiceView',
           choices: [
             'Foreground',
             'Open',
             'Background',
             'Closed'
           ]
         },
         defaultValue: 'Closed',
         help: 'The state of this application.'
      }
   ]


});


var Power = Model.create({

   name: 'PowerInfo',
   label: 'Power Information',

   properties: [
     {
         name:  'battery',
         type:  'float',
         view:  'foam.ui.FloatFieldView',
         help:  'Percentage of battery power remaining.',
         units: '%',
         defaultValue: 100
      },
      {
         name:  'watts',
         type:  'float',
         view:  'foam.ui.FloatFieldView',
         help:  'Power drain.',
         units: 'watts',
         defaultValue: 3
      },
      {
         name: 'recharging',
         label: 'Charging',
         type: 'Boolean',
         view: 'foam.ui.BooleanView',
         defaultValue: false,
         help: 'Indicates if currently recharging.'
      },
      {
         name: 'cell',
         label: '3G',
         type: 'float',
         view:  'foam.ui.FloatFieldView',
         defaultValue: 5,
         help: 'Indicates if currently recharging.'
      },
      {
         name: 'wifi',
         label: 'WiFi',
         type: 'Boolean',
         view: 'foam.ui.BooleanView',
         defaultValue: false,
         help: 'Indicates if currently recharging.'
      },
      {
         name: 'USB',
         type: 'float',
         view:  'foam.ui.FloatFieldView',
         defaultValue: 5,
         help: 'Power currently being drawn from USB connectors.'
      },
      {
         name: 'CPU',
         type: 'float',
         view: 'foam.ui.FloatFieldView',
         defaultValue: 10,
         help: 'CPU activity.'
      },
      {
         name: 'GPU',
         label: 'Graphics',
         type: 'float',
         view:  'foam.ui.FloatFieldView',
         defaultValue: 15,
         help: 'GPU activity.'
      },
      {
         name: 'backlite',
         label: 'Display',
         type: 'int',
         view:  'foam.ui.IntFieldView',
         defaultValue: 10,
         help: 'Backlite level.'
      },
      {
         name: 'applications',
         type: 'Array[ApplicationPower]',
         subType: 'ApplicationPower',
         view: 'foam.ui.ArrayView',
         factory: function() { return []; },
         help: 'Application power information.'
      }
   ],

   methods: {
      tick: function()
      {

      }
   }


});


var CloseApp = Model.create({

   extends: 'CView',

   name: 'CloseApp',
   label: 'Close Application',

   properties: [
      {
         name:  'name',
         label: 'Application Name',
         type:  'String',
         help:  'The name of the application.',
         defaultValue: ""
      },
      {
         name:  'image',
         type:  'image',
         help:  'The application\'s image.',
         defaultValue: ""
      },
      {
         name: 'enabled',
         type: 'Boolean',
         view: 'foam.ui.BooleanView',
         defaultValue: true,
         help: 'Indicates if currently enabled.'
      },
      {
         name: 'minDrain',
         label: 'Minimum Drain',
         type: 'float',
         defaultValue: '0',
         help: 'Average battery drain.'
      },
      {
         name: 'maxDrain',
         label: 'Maximum Drain',
         type: 'float',
         defaultValue: '0',
         help: 'Average battery drain.'
      },
      {
         name:  'width',
         type:  'int',
         defaultValue: 200
      },
      {
         name:  'height',
         type:  'int',
         defaultValue: 200
      }
   ],

   methods: {

      paint: function() {
         var canvas = this.canvas;
         var enabled = this.enabled;

         var img = new Image();
         img.onload = function(){
            this.width = this.height = 180;

            canvas.drawImage(img,31,31);
            canvas.shadowOffsetX = 3;
            canvas.shadowOffsetY = 3;
            canvas.shadowBlur = 3;
            canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

            canvas.strokeStyle = enabled ? 'red' : 'green';
            canvas.lineWidth = 15;

            canvas.beginPath();
            if ( enabled )
            {
               canvas.translate(this.width/2, this.height/2);
               canvas.rotate(-Math.PI/4);
               canvas.translate(-this.width/2, -this.height/2);
               canvas.moveTo(10,this.height/2);
               canvas.lineTo(this.width-10,this.height/2);
            }
            canvas.arc(this.width/2, this.height/2, this.width/2-10, 0, Math.PI*2, true);
            canvas.closePath();
            canvas.stroke();
         };
         img.src = 'images/power/' + this.image + '.png';
      },

      toString: function() {
         if ( this.name == "GPS" ) return "Enable GPS";
         if ( this.name == "WiFi" ) return "Disable WiFi";

         return "Close " + this.name;
      },

      analyzeHistory: function(history)
      {

      }
   }


});




var Screen = Model.create({

   extends: 'CView',

   name: 'Backlite',

   properties: [
      {
         name:  'name',
         label: 'Application Name',
         type:  'String',
         help:  'The name of the application.',
         defaultValue: "Dim Screen"
      },
      {
         name:  'level',
         type:  'int',
         defaultValue: 5
      },
      {
         name:  'width',
         type:  'int',
         defaultValue: 200
      },
      {
         name:  'height',
         type:  'int',
         defaultValue: 200
      }
   ],

   methods: {

      paint: function() {
         var canvas = this.canvas;

         this.canvas.fillStyle = 'white';
         this.canvas.fillRect(0, 0, this.width+2, this.height+2);

         canvas.shadowOffsetX = 3;
         canvas.shadowOffsetY = 3;
         canvas.shadowBlur = 3;
         canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

         canvas.lineWidth = 8;

         for ( var i = 0 ; i < 10 ; i++ )
         {
            canvas.strokeStyle = i+1 == this.level ? '#00dd00' : '#005500';

            canvas.beginPath();
            canvas.moveTo(20+i*15,80);
            canvas.lineTo(20+i*15,120);
            canvas.closePath();
            canvas.stroke();
         };
      },

      initHTML: function() {
       var me = this;
       CView.getPrototype().initHTML.call(this);
       this.canvasView.$.addEventListener('click', function(evt) {
          me.level = Math.max(1, Math.min(10, me.level + ((evt.offsetX > 100) ? 1 : -1)));
          me.paint();
//        evt.stopPropagation();
//        evt.cancelBubble = true;
//evt.preventDefault();
          console.log(evt);
       }, true);
       this.canvasView.$.addEventListener('mousedown', function(evt) {
          evt.stopPropagation();
evt.preventDefault();
          evt.cancelBubble = true;
       }, true);

      },

      toString: function() {
         return "Dim Screen";
      },

      analyzeHistory: function(history)
      {

      }
   }


});


var BatteryGraph = Model.create({

   extends: 'Graph',

   name:  'BatteryGraph',

   properties: [
       {
           name: 'displayProjection',
           type: 'Boolean',
           view: 'foam.ui.BooleanView',
           defaultValue: true,
           help: 'Enable the display of battery projections.'
       }
   ],

   methods: {
      paintDottedLine: function(x1, y1, x2, y2)
      {
         var canvas = this.canvas;
         var dx = x2-x1;
         var dy = y2-y1;
         var d = Math.sqrt(dx*dx+dy*dy);
         var n = Math.ceil(d/4);
         var step = d/n;

         for ( var i = 0 ; i < n ; i += step )
         {
            var x = x1 + i * dx/n;
            var y = y1 + i * dy/n;

            canvas.beginPath();
            canvas.arc(x, y, 3, 0, Math.PI*2, true);
            canvas.closePath();
            canvas.fill();
         }
      },

      paintLineData: function(canvas, x, y, xs, w, h, maxValue)
      {
         if ( this.data.length == 0 ) return;

         if ( ! this.displayProjection )
         {
            this.__super__.paintLineData.call(
               this, canvas, x, y, xs, w, h, maxValue);

            return;
         }

         var lastData = this.data[this.data.length-1].battery;
         var drain = calcBatteryUse(this.data);
         var life = estimateBatteryLife(this.data);
         var oldWidth = this.width;

         if ( drain[1] > 0 )
         {
            this.width = w * this.data.length / ( this.data.length + life[2] );
            this.__super__.paintLineData.call(this, canvas, x, y, xs, this.width-xs, h, maxValue);

            var x1 = this.width+x;
            var y1 = this.toY(lastData, maxValue);
            var y2 = this.toY(0, maxValue);

            canvas.fillStyle = '#dddddd';//this.graphColor;
            canvas.beginPath();
            canvas.moveTo(x1, this.toY(0,1));
            canvas.lineTo(x1, this.toY(lastData,maxValue));
            canvas.lineTo(oldWidth, y2);
            canvas.lineTo(x1, this.toY(0,1));
            canvas.fill();

            canvas.fillStyle = 'orange';
            this.paintDottedLine(x1, y1, oldWidth, y2);
            canvas.fillStyle = 'red';
            this.paintDottedLine(x1, y1, x1+life[0]/life[2]*(oldWidth-x1), y2);
            canvas.fillStyle = 'green';
            this.paintDottedLine(x1, y1, x1+life[1]/life[2]*(oldWidth-x1), y2);
         }
         else
         {
            if ( lastData > 99 ) {
               this.__super__.paintLineData.call(this, canvas, x, y, xs, w, h, maxValue);
            }
            else {
               life[1] = (lastData-100)/drain[1];
               // todo: fix next line
               this.width = w * this.data.length / ( this.data.length + life[1] );
               this.__super__.paintLineData.call(this, canvas, x, y, xs, this.width-xs, h, maxValue);

               var x1 = this.width+x;
               var y1 = this.toY(lastData, maxValue);
               var y2 = this.toY(maxValue, maxValue);

               canvas.fillStyle = '#dddddd';//this.graphColor;
               canvas.beginPath();
               canvas.moveTo(x1, this.toY(0,1));
               canvas.lineTo(x1, this.toY(lastData,maxValue));
               canvas.lineTo(oldWidth, y2);
               canvas.lineTo(oldWidth, this.toY(0,1));
               canvas.lineTo(x1, this.toY(0,1));
               canvas.fill();

               canvas.fillStyle = 'green';
               this.paintDottedLine(x1, y1, oldWidth, y2);
            }
         }

         this.width = oldWidth;
      }
   }
});


var BatteryMeter = Model.create({

   extends: 'CView',

   name: 'BatteryMeter',

   properties: [
     {
         name:  'battery',
         type:  'float',
         view:  'foam.ui.FloatFieldView',
         help:  'Percentage of battery power remaining.',
         units: '%',
         defaultValue: 100
      },
      {
         name: 'recharging',
         label: 'Charging',
         type: 'Boolean',
         view: 'foam.ui.BooleanView',
         defaultValue: false,
         help: 'Indicates if currently recharging.'
      },
      {
         name:  'width',
         type:  'int',
         defaultValue: 200
      },
      {
         name:  'height',
         type:  'int',
         defaultValue: 200
      }
   ],

   methods: {
      toHTML: function()
      {
         this.canvasView = Canvas.create({background:'rgba(0,0,0,0)',width:this.width+10, height:this.height+10});
         this.canvasView.addChild(this);
         return this.canvasView.toHTML();
      },
      link: function(powerInfo)
      {
         Events.follow(powerInfo.propertyValue('battery'), this.propertyValue('battery'));
         Events.follow(powerInfo.propertyValue('recharging'), this.propertyValue('recharging'));
      },

      paint: function() {
         var c = this.canvas;

         var capWidth = 15;
         var capHeight = 7;

         c.fillStyle = "rgba(234,238,243,1)";
         c.fillRect(0,0,this.width+10,this.height+10);

         c.fillStyle = this.recharging ? "red" : "green";
         var start = (100-this.battery)/100.0 * this.height;
         c.fillRect(0,start,this.width-2,this.height-start-2);

         c.fillStyle = "rgba(234,238,243,1)";
         c.shadowBlur = 0;
         c.shadowOffsetX = 0;
         c.shadowOffsetY = 0;
         c.fillRect(0,0,(this.width-capWidth)/2+2,capHeight+2);
         c.fillRect(this.width,0,-(this.width-capWidth)/2,capHeight+2);

         c.shadowOffsetX = 3;
         c.shadowOffsetY = 3;
         c.shadowBlur = 4;
         c.shadowColor = "rgba(0, 0, 0, 0.4)";
         c.lineWidth = 4;

         c.strokeStyle = "#555";

         c.beginPath();
         c.moveTo(2,capHeight); // top-left

         // cap
         c.lineTo((this.width-capWidth)/2+1.5, capHeight);
         c.lineTo((this.width-capWidth)/2+1.5, 2);
         c.lineTo((this.width+capWidth)/2+1.5, 2);
         c.lineTo((this.width+capWidth)/2+1.5, capHeight);

         c.lineTo(this.width, capHeight); // top-right
         c.lineTo(this.width, this.height); // bottom-right
         c.lineTo(2, this.height); // bottom-left
         c.lineTo(2,capHeight); // top-left
         c.closePath();
         c.stroke();

         // glare
         var grad = c.createLinearGradient(0,0,this.width,0);
         grad.addColorStop(0.15, 'rgba(0,0,0,0.4)');
         grad.addColorStop(0.5, 'rgba(0,0,0,0.0)');
         grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
         grad.addColorStop(0.9, 'rgba(255,255,255,0.5)');

         c.fillStyle = grad;
         c.fillRect(4,capHeight+2,this.width-6,this.height-capHeight-4);
      }
  }


});


var NeedleMeter = Model.create({

   extends: 'CView',

   name: 'NeedleMeter',

   properties: [
     {
         name:  'label',
         type:  'String',
         help:  'The label to appear on the meter.',
         defaultValue: ""
     },
     {
         name:  'value',
         type:  'float',
         view:  'foam.ui.FloatFieldView',
         help:  'Value.',
         defaultValue: 1
     },
     {
         name:  'maxValue',
         label: 'Max. Value',
         type:  'float',
         view:  'foam.ui.FloatFieldView',
         help:  'Maximum Value.',
         defaultValue: 10
      },
      {
         name:  'width',
         type:  'int',
         defaultValue: 200
      },
      {
         name:  'height',
         type:  'int',
         defaultValue: 200
      }
   ],

   methods: {
      toHTML: function()
      {
         this.canvasView = Canvas.create({background:'rgba(0,0,0,0)',width:this.width+4, height:this.height+4});
         this.canvasView.addChild(this);
         return this.canvasView.toHTML();
      },

      link: function(powerInfo)
      {
         Events.follow(powerInfo.propertyValue('watts'), this.propertyValue('value'));
      },

      rotateToValue: function(x, y, value) {
         var c = this.canvas;
         var a = value / this.maxValue * (3.0*Math.PI/5.0)-1.5*Math.PI/5.0;

         c.save();

         c.translate(x,y);
         c.rotate(a);
         c.translate(-x,-y);
      },

      paint: function() {
         var c = this.canvas;

         var r = this.height-30;
         var x = this.width/2+1;
         var y = this.height-8;

         c.shadowOffsetX = 0;
         c.shadowOffsetY = 0;
         c.shadowBlur = 0;

         c.fillStyle = "black";
         c.fillRect(0,0,this.width+10,this.height+10);
         c.fillStyle = "white";
         c.fillRect(2,2,this.width,this.height);

         c.strokeStyle = 'black';
         c.lineWidth = 2;
         c.beginPath();
         c.arc(x, y, r, -Math.PI/5.0, -4.0*Math.PI/5.0, true);
         c.stroke();

         c.fillStyle = 'black';
         c.textAlign = 'center';
         c.font = "16pt sans-serif";
         c.fillText("W", x, y-30,20);

         this.rotateToValue(x,y,this.value);

         c.lineWidth = 1;
         c.shadowOffsetX = 2;
         c.shadowOffsetY = 2;
         c.shadowBlur = 1;
         c.shadowColor = "gray";

         c.beginPath();
         c.moveTo(this.width/2+3, this.height-10);
         c.lineTo(this.width/2+3, this.height+5-r);
         c.stroke();

         c.fillStyle='white';
         c.fillRect(this.width/2+3, this.height-10, 1, -r+15);
         c.strokeStyle = 'red';
         c.beginPath();
         c.moveTo(this.width/2+3, this.height+5-r);
         c.lineTo(this.width/2+3, this.height-20-r);
         c.stroke();
         c.fillStyle='white';
         c.fillRect(this.width/2+3, this.height+5-r, 1, -30);
         c.restore();

         for ( var i = 0 ; i <= this.maxValue ; i++ )
         {
            this.rotateToValue(x,y,i);

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

         for ( var i = 0 ; i < this.maxValue ; i++ )
         {
            this.rotateToValue(x,y,i+0.5);

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


/** @return [min,avg,max] battery drain **/
function calcBatteryUse(powerHistory)
{
   var min = Infinity, sum=0, count=0, max=0, last=0;

   for ( var i = 1 ; i < powerHistory.length ; i++ )
   {
      var p1 = powerHistory[i-1];
      var p2 = powerHistory[i];
      var d  = p1.battery - p2.battery; // positive battery drain

      // when power drain changes direction, reset last value
      if ( d<0 != last<0 ) last = 0;

      // take an exponential-moving-average for the last value
      last = last ? last*0.9+0.1*d : d;

      if ( d > 0.0 ) {
         min = Math.min(min, d);
         max = Math.max(max, d);
         sum += d;
         count++;
      }
   }

   return [min,last/*count?sum/count:0*/,max];
}


/** @return [min,expected,max] battery life **/
function estimateBatteryLife(powerHistory)
{
   var batteryUse = calcBatteryUse(powerHistory);
   var battery = powerHistory[powerHistory.length-1].battery;

   return [
      /*Math.floor(*/battery/batteryUse[2],
      /*Math.floor(*/battery/batteryUse[1],
      /*Math.floor(*/battery/batteryUse[0]/*)*/
   ];
}


function formatTimeEstimate(est)
{
   var hours = Math.floor(est / 240);
   var mins  = Math.floor((est - 240*hours)/4);

   return hours ? hours + "h " + mins + "m" : mins + "m";
}
