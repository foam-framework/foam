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
  extends: 'foam.graphics.Circle',

  traits: [ 'com.google.misc.Colors' ],

  requires: [
    'foam.graphics.Circle',
    'foam.ui.IntFieldView'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'drawTicks',
    },
    {
      type: 'Float',
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
      factory: function() {
        return this.Hand.create({r:this.r-6, width:5, color: this.GREEN});
      }
    },
    {
      name: 'hourHand',
      factory: function() {
        return this.Hand.create({r:this.r-15, width:7, color: this.YELLOW});
      }
    },
    {
      name: 'secondHand',
      factory: function() {
        return this.Hand.create({r:this.r-6, width:3, color: this.RED});
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.border = this.color;
      this.borderWidth = 5;
      this.color = 'white';

      this.addChild(this.hourHand);
      this.addChild(this.minuteHand);
      this.addChild(this.secondHand);
    },

    paintSelf: function(c) {
      this.SUPER(c);

      var date = new Date();

      this.secondHand.a = Math.PI/2 - Math.PI*2 * date.getSeconds() / 60 ;
      this.minuteHand.a = Math.PI/2 - Math.PI*2 * date.getMinutes() / 60 ;
      this.hourHand.a   = Math.PI/2 - Math.PI*2 * (date.getHours() % 12) / 12 + this.minuteHand.a / 12;

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
    {
      name: 'Hand',
      label: 'Clock Hand',
      extends: 'foam.graphics.CView',

      properties:
      [
        {
          model_: 'Property',
          name: 'color',
          type: 'String',
          defaultValue: 'blue'
        },
        {
          type: 'Int',
          name: 'width',
          defaultValue: 5
        },
        {
          type: 'Int',
          name: 'r',
          label: 'Radius',
          defaultValue: 100
        },
        {
          type: 'Int',
          name: 'a',
          label: 'Rotation',
          defaultValue: 100
        }
      ],
      methods:
      [
        function paint(canvas) {
          canvas.beginPath();
          canvas.moveTo(0,0);
          canvas.lineTo(this.r*Math.cos(this.a),-this.r*Math.sin(this.a));
          canvas.closePath();

          canvas.lineWidth = this.width;
          canvas.strokeStyle = this.color;
          canvas.stroke();
        }
      ]
    }
  ]
});
