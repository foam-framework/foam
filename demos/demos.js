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
FOAModel({
  name:  'EyeCView',
  label: 'Eye',

  extendsModel: 'CView',

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'red'
    },
    {
      name:  'r',
      label: 'Radius',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 100
    },
    {
      name:  'lid',
      type:  'Circle',
      paint: true,
      factory: function() {
        return Circle.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
      }
    },
    {
      name:  'white',
      type:  'Circle',
      paint: true,
      factory: function() {
        return Circle.create({x:this.x,y:this.y,r:this.r-10,color:'white',parent:this});
      }
    },
    {
      name:  'pupil',
      type:  'Circle',
      paint: true,
      factory: function() {
        return Circle.create({x:this.x,y:this.y,r:10,color:'black',parent:this});
      }
    }
  ],

  methods: {
    watch: function(target) { this.target_ = target; },
    paint: function() {
      this.pupil.x = this.lid.x = this.white.x = this.x;
      this.pupil.y = this.lid.y = this.white.y = this.y;

      // point pupil towards target
      if ( this.target_ )
        Movement.stepTowards(this.target_, this.pupil, this.r-26);

      this.canvas.save();
      this.canvas.translate(this.x,this.y);
      this.canvas.rotate(-Math.PI/100);
      this.canvas.scale(1.0,1.3);
      this.canvas.translate(-this.x,-this.y);

      this.lid.paint();
      this.white.paint();
      this.pupil.paint();

      this.canvas.restore();
    }
  }
});


FOAModel({
  name:  'EyesCView',
  label: 'Eyes',
  extendsModel: 'CView',

  properties: [
    {
      name:  'leftEye',
      label: 'Left',
      type:  'Eye',
      paint: true,
      factory: function() {
        return EyeCView.create({x:this.x+50,y:this.y+50,r:50,color:'red',parent:this});
      }
    },
    {
      name:  'rightEye',
      label: 'Right',
      type:  'Eye',
      paint: true,
      factory: function() {
        return EyeCView.create({x:this.x+120,y:this.y+65,r:48,color:'yellow',parent:this});
      }
    }
  ],

  methods: {
    watch: function(target) {
      this.leftEye.watch(target);
      this.rightEye.watch(target);
    },
    paint: function() {
      this.leftEye.paint();
      this.rightEye.paint();
    }
  }
});


FOAModel({
  name:  'ClockView',
  extendsModel: 'CView',

  label: 'Clock',

  properties: [
    {
      name:  'color',
      type:  'String',
      defaultValue: 'yellow'
    },
    {
      name:  'lid',
      type:  'Circle',
      paint: true,
      factory: function() {
        return Circle.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
      }
    },
    {
      name:  'white',
      type:  'Circle',
      paint: true,
      factory: function() {
        return Circle.create({x:this.x,y:this.y,r:this.r-3,color:'white',parent:this});
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
      extendsModel: 'CView',
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


var System = FOAM({

  model_: 'Model',

  name:  'System',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'title',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'devColor',
      label: 'Color of Developers',
      type:  'String',
      defaultValue: 'red'
    },
    {
      name:  'numDev',
      label: 'Number of Developers',
      type:  'int',
      postSet: function(_, devs) {
        if ( ! this.cIndex ) this.cIndex = 1;
        var colours = ['#33f','#f00','#fc0','#33f','#3c0'];

        if ( ! this.devs ) return;
        while ( this.devs.length > (devs << 0) ) this.devs.pop();
        while ( this.devs.length < (devs << 0) ) {
          this.devs.unshift(Developer.create({color:this.devColor == 'google' ? colours[this.cIndex++ % colours.length] : this.devColor}));
          this.devs[0].parent = this.parent;
        }
      },
      defaultValue: 10
    },
    {
      name:  'totalCode',
      label: 'Code',
      type:  'int',
      defaultValue: 0
    },
    {
      name: 'features',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValue: [],
      help: 'Features to be implemented be Entity.'
    },
    {
      name: 'entities',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValue: [],
      help: 'Data entities to be supported.'
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'selectedX',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'selectedY',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'mouse',
      type:  'Mouse',
      view: {
        create: function() { return DetailView.create({model: Mouse}); }
      },
      factory: function() {
        return Mouse.create();
      }
    },
    {
      model_: 'Property',
      name: 'alpha',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 1
    }
  ],

  methods: {
    erase: function() {
      this.canvas.globalAlpha = 0.2;
      //        AbstractPrototype.erase.call(this);
    },

    init: function(values)
    {
      this.SUPER(values);

      this.parent.addChild(this);

      this.mouse.connect(this.parent.$);

      Events.dynamic(function() {
        //           console.log(this.mouse.x, this.mouse.y);
        //           console.log(this.x, this.width, this.features.length);
        this.selectedX = Math.floor((this.mouse.x-this.x)/this.width*(this.features.length+1));
        this.selectedY = Math.floor((this.mouse.y-this.y-25)/(this.height-25)*(this.entities.length+1));
      }.bind(this));

      this.code = [];
      this.devs = [];

      var tmp = this.numDev;
      this.numDev = 0;
      this.numDev = tmp;
      /*
        for ( var i = 0 ; i < this.numDev ; i++ ) {
        this.devs[i] = Developer.create({color:this.devColor == 'google' ? colours[cIndex++ % colours.length] : this.devColor});
        this.devs[i].parent = this.parent;
        // this.parent.addChild(this.devs[i]);
        }
      */

      this.codeGraph = Graph.create({x:20, y:20, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});
      this.utilityGraph = Graph.create({x:20, y:260, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});
      this.efficiencyGraph = Graph.create({x:20, y:500, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});

      this.l = Label.create({parent: this.parent, align: 'left', font:'18pt Arial', x:20, y:18});
      Events.follow(this.propertyValue('title'), this.l.propertyValue('text'));
    },

    totalUtility: function() {
      var u = 0;

      for ( var i = 1 ; i <= this.features.length ; i++ )
        for ( var j = 1 ; j <= this.entities.length ; j++ )
          u += this.uc(i, j);

      return u;
    },

    moveDev: function(dev, x, y) {
      if ( dev.moving ) return;

      dev.f = x;
      dev.e = y;

      var w = this.parent.width-15;
      var h = this.parent.height-28;
      var fs = this.features.length+1;
      var es = this.entities.length+1;

      dev.moveTo(w/fs * ( x + 0.7*Math.random() + 0.15), h/es * ( y + 0.7*Math.random() + 0.15));
    },

    addCode: function(x, y, lines) {
      this.totalCode += lines;
      if ( ! this.code[x] ) this.code[x] = [];
      this.code[x][y] = (this.code[x][y] || 0) + lines;
    },

    // Code-Count
    cc: function(x, y) {
      if ( ! this.code[x] ) return 0;
      if ( ! this.code[x][y] ) return 0;

      return this.code[x][y];
    },

    // Utility-Count
    uc: function(x, y) {
      return this.cc(x, y) + this.cc(x, 0) * this.cc(0, y)/10;
    },

    tick: function(timer) {
      //        for ( var i = 0 ; i < this.devs.length ; i++ ) this.architecture(this, this.devs[i]);
      for ( var i = 0 ; i < this.devs.length ; i++ ) if ( i % 20 == timer.i % 20 ) this.architecture(this, this.devs[i]); else this.addCode(this.devs[i].f, this.devs[i].e, 0.3);
    },

    multics: function(system, dev) {
      var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
      var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

      if ( ! dev.f ) {
        system.moveDev(dev, nx, ny);
      }

      randomAct(
        7, function() {
          system.addCode(dev.f, dev.e, 1);
        },
        2, function() {
          system.moveDev(dev, dev.f, dev.e);
        },
        1, function() {
          system.moveDev(dev,dev.f && Math.random() < 0.7 ? dev.f : nx, dev.e && Math.random() < 0.7 ? dev.e : ny);
        });
    },

    foam: function(system, dev)
    {
      var r = Math.random();
      var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
      var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

      if ( dev.f === undefined ) {
        dev.f = nx;
        dev.e = ny;
      }

      randomAct(
        4, function() {
          system.moveDev(dev, nx, ny);
        },
        4, function() {
          system.moveDev(dev, dev.f, dev.e);
        },
        5, function() {
          system.moveDev(dev, 0, ny);
        },
        90, function() {
          system.moveDev(dev, nx, 0);
        });

      system.addCode(dev.f, dev.e, 1);
    },

    unix: function(system, dev)
    {
      var r = Math.random();
      var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
      var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

      if ( dev.f === undefined ) {
        //          r = r / 10 + 0.9;
        system.moveDev(dev, 1, 0);
      }

      if ( r < 0.7 && system.cc(dev.f,dev.e) < 1.1 * system.totalCode / (system.features.length + system.entities.length)) {
        system.moveDev(dev, dev.f, dev.e);
      }
      else if ( r < 0.85 ) {
        system.moveDev(dev, nx, 0);
      }
      else {
        system.moveDev(dev, 0, ny);
      }

      system.addCode(dev.f, dev.e, 1);
    },

    mixed: function(system, dev) {
      if ( dev.color === 'red' ) return System.getPrototype().unix(system, dev);
      return System.getPrototype().multics(system, dev);
    },

    paint: function() {
      if ( ! this.parent ) return;
      var c = this.parent.canvas;
      var w = this.parent.width-15;
      var h = this.parent.height-28;
      var fs = this.features.length;
      var es = this.entities.length;

      if ( ! this.width ) this.width = this.parent.width;
      if ( ! this.height ) this.height = this.parent.height;
      // this.l.x = this.width/2;

      c.save();
      c.globalAlpha = this.alpha;

      c.translate(this.x, this.y);
      c.scale(this.width/this.parent.width, this.height/this.parent.height);

      this.l.paint();

      c.translate(0, 25); // make space for the title

      // draw feature labels along the top row
      for ( var i = 0 ; i <= fs ; i++ ) {
        c.fillStyle = 'lightGray';
        c.fillRect(i*w/(fs+1),0,w/(fs+1),h/(es+1));
        c.fillStyle = 'black';
        if ( i > 0 ) c.fillText(this.features[i-1], i*w/(fs+1)+5 , h/(es+1)/2+5);
      }
      // draw entity labels along the left column
      for ( var i = 0 ; i <= es ; i++ ) {
        c.fillStyle = 'lightGray';
        c.fillRect(0, i*h/(es+1),w/(fs+1),h/(es+1));
        c.fillStyle = 'black';
        if ( i > 0 ) c.fillText(this.entities[i-1], 8, (i+0.5)*h/(es+1)+3, w/(fs+1)-15);
      }

      // draw grid-lines
      c.fillStyle = 'gray';
      for ( var i = 0 ; i < fs ; i++ )
        c.fillRect((1+i)*w/(fs+1),0,3,h);
      for ( var i = 0 ; i < es ; i++ )
        c.fillRect(0,(1+i)*h/(es+1),w,3);

      // draw individual cell contents
      c.fillStyle = '#55ee55';
      for ( var i = 0 ; i <= fs ; i++ )
        for ( var j = 0 ; j <= es ; j++ ) {
          var code = Math.min(h/es/5-2, this.cc(i, j)/300);
          var utility = Math.min(h/es/5-2, this.uc(i, j)/300);

          // Logarithmic Scale
          /*
            var code = Math.log(this.cc(i, j));
            var utility = Math.log(this.uc(i, j));
          */

          c.fillStyle = 'orange';
          c.fillRect(i*w/(fs+1)+3,(j+1)*h/(es+1),w/(fs+1)-3,-utility*5);

          c.fillStyle = '#55ee55';
          c.fillRect(i*w/(fs+1)+3,(j+1)*h/(es+1),w/(fs+1)-3,-code*5);
          // c.fillRect(i*w/(fs+1)+5,(j+1)*h/(es+1)-code/10-1,code%10 * (w/(fs+1))/10,1);

          if ( i == this.selectedX && j == this.selectedY ) {
            c.strokeStyle = 'red';
            c.lineWidth = 3;
            c.strokeRect(i*w/(fs+1)+4,(j+1)*h/(es+1)-1,w/(fs+1)-5,-h/(es+1)+5);
          }
        }

      c.strokeStyle = this.color;
      c.lineWidth = 3;
      c.strokeRect(2, 2, w, h-2);

      for ( var i = 0 ; i < this.devs.length ; i++ )
        this.devs[i].paint();

      c.restore();
    }
  }
});


FOAModel({
  name:  'Developer',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    program: function() {
      if ( ! this.moving && Math.random() < 0.2 ) this.move();
    },

    move_notused: function() {
      //         if ( this.moving ) return;
      this.moving = true;

      var obj = this;
      Movement.animate(
        timer.interval*20,
        function() {
          /* if ( Math.random() < 0.1 ) */ obj.x = Math.random()*obj.parent.width;
          if ( Math.random() < 0.25 ) obj.y = Math.random()*obj.parent.height;
        },
        Movement.linear /*ease(0.35, 0.35)*/,
        function() { this.moving = false; }.bind(this))();
    },

    moveTo: function(x,y) {
      if ( this.moving ) return;

      this.moving = true;

      var obj = this;
      Movement.animate(
        timer.interval*30,
        function() {
          obj.x = x;
          obj.y = y;
        },
        Movement.linear /*ease(0.35, 0.35)*/,
        function() { this.moving = false; }.bind(this))();
    },

    paint: function() {
      var canvas = this.parent.canvas;

      canvas.fillStyle = this.color;

      canvas.beginPath();
      canvas.arc(this.x, this.y, 6, 0, Math.PI*2, true);
      canvas.closePath();
      canvas.fill();
    }
  }
});
