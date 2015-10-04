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
  package: 'foam.demos',
  name: 'ClockView',

  extendsModel: 'foam.graphics.Circle',

  traits: [ 'com.google.misc.Colors' ],

  requires: [
    'foam.graphics.Circle',
    'foam.ui.IntFieldView'
  ],

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'drawTicks',
    },
    {
      model_: 'FloatProperty',
      name: 'r',
      label: 'Radius',
      defaultValue: 100
    },
    {
      name: 'color',
      type: 'String',
      factory: function() { return this.BLUE; }
    },
    {
      name: 'minuteHand',
      type: 'Hand',
      factory: function() {
        return this.Hand.create({r:this.r-6, width:5, color: this.GREEN});
      }
    },
    {
      name: 'hourHand',
      type: 'Hand',
      factory: function() {
        return this.Hand.create({r:this.r-15, width:7, color: this.YELLOW});
      }
    },
    {
      name: 'secondHand',
      type: 'Hand',
      factory: function() {
        return this.Hand.create({r:this.r-6, width:3, color: this.RED});
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.border = this.BLUE;
      this.borderWidth = 5;
      this.color = 'white';
      
      this.addChild(this.hourHand);
      this.addChild(this.minuteHand);
      this.addChild(this.secondHand);
    },

    paintSelf: function() {
      this.SUPER();

      var date = new Date();

      this.secondHand.a = Math.PI/2 - Math.PI*2 * date.getSeconds() / 60 ;
      this.minuteHand.a = Math.PI/2 - Math.PI*2 * date.getMinutes() / 60 ;
      this.hourHand.a   = Math.PI/2 - Math.PI*2 * (date.getHours() % 12) / 12 + this.minuteHand.a / 12;

      var c = this.canvas;
      
      if ( ! this.drawTicks ) return;

      for ( var i = 0 ; i < 12 ; i++ ) {
        var a = Math.PI*2/12*i;
        var l = i % 3 ? 6 : 10;
        var w = i % 3 ? 2 : 3;
        c.beginPath();
        c.moveTo((this.r-l)*Math.cos(a),-(this.r-l)*Math.sin(a));
        c.lineTo((this.r)*Math.cos(a),-(this.r)*Math.sin(a));
        c.closePath();
        
        c.lineWidth = w;
        c.strokeStyle = this.BLUE;
        c.stroke();
      }
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
          view: 'foam.ui.IntFieldView',
          defaultValue: 5
        },
        {
          model_: 'Property',
          name: 'r',
          label: 'Radius',
          type: 'int',
          view: 'foam.ui.IntFieldView',
          defaultValue: 100
        },
        {
          model_: 'Property',
          name: 'a',
          label: 'Rotation',
          type: 'int',
          view: 'foam.ui.IntFieldView',
          defaultValue: 100
        }
      ],
      methods:
      [
        {
          model_: 'Method',
          name: 'paint',
          code: function () {
            var canvas = this.parent.canvas;

            canvas.beginPath();
            canvas.moveTo(0,0);
            canvas.lineTo(this.r*Math.cos(this.a),-this.r*Math.sin(this.a));
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
