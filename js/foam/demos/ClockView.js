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
  name:  'ClockView',
  package: 'foam.demos',
  
  extendsModel: 'foam.graphics.CView',
  
  requires: ['foam.graphics.Circle'],
  
  label: 'Clock',

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'yellow'
    },
    {
      name:  'lid',
      type:  'foam.graphics.Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
      }
    },
    {
      name:  'white',
      type:  'foam.graphics.Circle',
      paint: true,
      factory: function() {
        return this.Circle.create({x:this.x,y:this.y,r:this.r-3,color:'white',parent:this});
      }
    },
    {
      name:  'r',
      label: 'Radius',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 100
    },
    {
      name:  'a',
      label: 'Rotation',
      type:  'float',
      view:  'IntFieldView',
      defaultValue: 0
    },
    {
      name:  'hourHand',
      type:  'Hand',
      paint: true,
      factory: function() {
        return this.Hand.create({x:this.x,y:this.y,r:this.r-15,width:7,color:'green',parent:this});
      }
    },
    {
      name:  'minuteHand',
      type:  'Hand',
      paint: true,
      factory: function() {
        return this.Hand.create({x:this.x,y:this.y,r:this.r-6,width:5,color:'blue',parent:this});
      }
    },
    {
      name:  'secondHand',
      type:  'Hand',
      paint: true,
      factory: function() {
        return this.Hand.create({x:this.x,y:this.y,r:this.r-6,width:3,color:'red',parent:this});
      }
    }

  ],

  methods: {
    paint: function() {
      this.canvas.save();

      this.canvas.translate(this.x, this.y);
      this.canvas.rotate(this.a);
      this.canvas.translate(-this.x, -this.y);

      var date = new Date();

      this.secondHand.x = this.hourHand.x = this.minuteHand.x = this.lid.x = this.white.x = this.x;
      this.secondHand.y = this.hourHand.y = this.minuteHand.y = this.lid.y = this.white.y = this.y;

      this.secondHand.a = Math.PI/2 - Math.PI*2 * date.getSeconds() / 60 ;
      this.minuteHand.a = Math.PI/2 - Math.PI*2 * date.getMinutes() / 60 ;
      this.hourHand.a   = Math.PI/2 - Math.PI*2 * (date.getHours() % 12) / 12;

      this.lid.paint();
      this.white.paint();
      this.hourHand.paint();
      this.minuteHand.paint();
      this.secondHand.paint();

      this.canvas.restore();
    }
  },

  models: [
    FOAM({
      model_: 'Model',
      name: 'Hand',
      label: 'Clock Hand',
      extendsModel: 'foam.graphics.CView',
      properties:
      [
        {
          model_: 'Property',
          name: 'color',
          type: 'String',
          defaultValue: 'blue'
        },
        {
          model_: 'Property',
          name: 'width',
          type: 'int',
          view: 'IntFieldView',
          defaultValue: 5
        },
        {
          model_: 'Property',
          name: 'r',
          label: 'Radius',
          type: 'int',
          view: 'IntFieldView',
          defaultValue: 100
        },
        {
          model_: 'Property',
          name: 'a',
          label: 'Alpha',
          type: 'int',
          view: 'IntFieldView',
          defaultValue: 100
        }
      ],
      methods:
      [
        {
          model_: 'Method',
          name: 'paint',
          code: function ()
          {
            var canvas = this.parent.canvas;

            canvas.beginPath();
            canvas.moveTo(this.x,this.y);
            canvas.lineTo(this.x+this.r*Math.cos(this.a),this.y-this.r*Math.sin(this.a));
            canvas.closePath();

            canvas.lineWidth = this.width;
            canvas.strokeStyle = this.color;
            canvas.stroke();
          }
        }
      ]
    })
  ]
});


