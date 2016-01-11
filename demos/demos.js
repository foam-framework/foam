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

CLASS({
  name: 'System',

  requires: [ 'foam.input.Mouse' ],

  properties: [
    {
      name:  'parent',
      // type:  'CView',
      hidden: true
    },
    {
      name:  'title',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'font',
      defaultValue: '20pt Arial'
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
      type:  'Int',
      name:  'numDev',
      label: 'Number of Developers',
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
      type:  'Int',
      defaultValue: 0
    },
    {
      name: 'features',
      // type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      factory: function() { return []; },
      help: 'Features to be implemented be Entity.'
    },
    {
      name: 'entities',
      // type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      factory: function() { return []; },
      help: 'Data entities to be supported.'
    },
    {
      name:  'x',
      type:  'Int',
      defaultValue: 0
    },
    {
      name:  'y',
      type:  'Int',
      defaultValue: 0
    },
    {
      name:  'selectedX',
      type:  'Int',
      preSet: function(oldX, x) {
        return ( x < 0 || x > this.features.length ) ? oldX : x;
      },
      defaultValue: 0
    },
    {
      name:  'selectedY',
      type:  'Int',
      preSet: function(oldY, y) {
        return ( y < 0 || y > this.entities.length ) ? oldY : y;
      },
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'Int',
      defaultValue: 0
    },
    {
      name:  'height',
      type:  'Int',
      defaultValue: 0
    },
    {
      name:  'mouse',
      view: { factory_: 'foam.ui.DetailView', model: this.Mouse },
      factory: function() {
        return this.Mouse.create();
      }
    },
    {
      model_: 'Property',
      name: 'alpha',
      type: 'Int',
      view: 'foam.ui.IntFieldView',
      defaultValue: 1
    }
  ],

  methods: {
    erase: function() {
      this.canvas.globalAlpha = 0.2;
      //        FObject.erase.call(this);
    },

    init: function(values) {
      this.SUPER(values);

      this.code = [];
      this.devs = [];

      this.parent.addChild(this);

      this.l = Label.create({parent: this.parent, align: 'left', font:'18pt Arial', x:20, y:18});

      this.mouse.connect(this.parent.$);

      Events.dynamicFn(function() {
        //           console.log(this.mouse.x, this.mouse.y);
        //           console.log(this.x, this.width, this.features.length);
        this.selectedX = Math.floor((this.mouse.x-this.x)/this.width*(this.features.length+1));
        this.selectedY = Math.floor((this.mouse.y-this.y-25)/(this.height-25)*(this.entities.length+1));
      }.bind(this));

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

//      Events.follow(this.propertyValue('title'), this.l.propertyValue('text'));
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
        if ( ! this.devs ) return;
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

    foam: function(system, dev) {
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
        20, function() {
          system.moveDev(dev, 0, ny);
        },
        75, function() {
          system.moveDev(dev, nx, 0);
        });

      system.addCode(dev.f, dev.e, 1);
    },

    unix: function(system, dev) {
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
      if ( ! this.parent || ! this.devs ) return;
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

      this.l.text = this.title;
      this.l.paint();

      c.translate(0, 25); // make space for the title
      c.font = this.font;
      // draw feature labels along the top row
      for ( var i = 0 ; i <= fs ; i++ ) {
        c.fillStyle = 'lightGray';
        c.fillRect(i*w/(fs+1),0,w/(fs+1),h/(es+1));
        c.fillStyle = 'black';
        if ( i > 0 ) c.fillText(this.features[i-1], i*w/(fs+1)+5 , h/(es+1)/2+11);
      }
      // draw entity labels along the left column
      for ( var i = 0 ; i <= es ; i++ ) {
        c.fillStyle = 'lightGray';
        c.fillRect(0, i*h/(es+1),w/(fs+1),h/(es+1));
        c.fillStyle = 'black';
        if ( i > 0 ) c.fillText(this.entities[i-1], 8, (i+0.5)*h/(es+1)+11, w/(fs+1)-15);
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


CLASS({
  name:  'Developer',

  properties: [
    {
      name:  'parent',
      // type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'x',
      type:  'Int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'Int',
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
