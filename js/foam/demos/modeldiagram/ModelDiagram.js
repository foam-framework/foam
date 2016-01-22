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

// TODO(kgr): add rotation to CView to complete demo
CLASS({
  package: 'foam.demos.modeldiagram',
  name: 'ModelDiagram',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.demos.modeldiagram.Person',
    'foam.demos.supersnake.Robot',
    'foam.ui.DetailView',
    'foam.ui.TableView',
    'foam.ui.HelpView',
    'foam.ui.md.DetailView as MDDetailView',
    'foam.documentation.DocViewPicker',
    'foam.documentation.diagram.DocDiagramView',
    'foam.graphics.CView',
    'foam.graphics.Rectangle',
    'foam.graphics.ImageCView',
    'foam.graphics.ViewCView',
    'foam.graphics.LabelledBox as Box',
    'foam.util.JavaSource',
    'foam.util.swift.SwiftSource',
    'foam.graphics.Circle'
  ],

  properties: [
    [ 'width', 1700 ],
    [ 'height', 1100 ]
  ],

  methods: {
    initCView: function() {
      var self  = this;
      var v     = this.Box.create({width: 500, height: 600, x:100, y: 145, text: 'Model', background: '#ccf', color: 'white', font: '28pt Arial'});
      var cls   = this.Box.create({width: 500, height: 600, x:800, y: 145, text: 'Class', font: '28pt Arial'});
      var robot = this.Robot.create({x:400,y:165,width:200,height:220,scaleX:0,scaleY:0});
      var display = self.ViewCView.create({
        innerView: { toHTML: function() { return '<div id="display" class="foam-demos-modeldiagram-display"></div>'; }, initHTML: function() { } },
        x: 100,
        y: 600,
        width: 1260,
        height: 680
      });

      GLOBAL.anim = this;
      this.addChildren(v, robot, cls, display);

      function addImage(parent, src) {
        var bg  = self.Rectangle.create({background: 'white', width: parent.width-1, height: parent.height-1});
        var img = self.ImageCView.create({src: src});

        parent.addChildren(bg);
        bg.addChildren(img);

        img.height$.addListener(function() {
          var scale = Math.min((parent.width-2)/img.width, (parent.height-2)/img.height);
          img.width = img.width*scale;
          img.height = img.height*scale;
        });

        return bg;
      }

      var m0, m1;
      var c0, c1;

      var anim = [
        [0],
        function() {
          c0 = addImage(cls, 'js/foam/demos/modeldiagram/PersonES6.png');
        },
        [0],
        function() {
          m0 = addImage(v, 'js/foam/demos/modeldiagram/PersonV0.png');
        },
        [0],
        function() {
          m0.parent.removeChild(m0);
          m0 = addImage(v, 'js/foam/demos/modeldiagram/PersonV05.png');
          c1 = addImage(cls, 'js/foam/demos/modeldiagram/PersonJava.png');
        },
        [0],
        [500, function() {
          cls.x += 150;
          cls.alpha = 0;
        }],
        function() {
          v.width += 200;
          m1 = addImage(v, 'js/foam/demos/modeldiagram/PersonV1.png');
        },
        [0],
        [500, function() {
          m0.alpha = m1.alpha = 0;
        }],
        [500, function() { v.width /= 4.5; v.height /= 4.5; cls.alpha = 0; } ],
        function() { self.removeChild(cls); },
        [500, function() { robot.scaleX = robot.scaleY = 3; } ],
        [0]
      ];

      var fnum = 0;
      function feature(f, anim, xo, yo, timeWarp) {
        var factory = f.factory;
        var pause   = f.factory || f.pause;

        timeWarp = timeWarp || 1;
        var b = self.Box.create({alpha: 0.7, width: v.width/5+15, height: v.height/5, x: robot.x, y: v.y, text: f.name, font: '14pt Arial'});
        var num = fnum++;
        var x = num % 5;
        var y = Math.floor(num/5);

//        if ( f.pause ) anim.push([[0]]);
        anim.push(function() { self.addChild(b); });
        if ( pause ) {
          if ( f.factory ) anim.push(function() { self.setDisplay(factory); });
          anim.push([300*timeWarp, function() { b.x += 250 + xo; b.y-=80; b.scaleX = b.scaleY = 3; }]);
          anim.push([[0]]);
          if ( factory ) anim.push(function() { self.setDisplay(); });
          anim.push([150*timeWarp, function() { b.scaleX = b.scaleY = 1; b.x += x * b.width*1.4; b.y += yo + b.height*1.2 * y; }]);
        } else {
          anim.push([500*timeWarp, function() { b.x += 250 + xo + x * b.width*1.4; b.y += yo + b.height*1.2 * y - 80; }]);
        }

        return b;
      }

      var p = this.Person.create({
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        age: 42,
        married: true
      });
      var people = [
        p,
        this.Person.create({id: 2, firstName: 'Janet', lastName: 'Jones', age: 38, married: true}),
        this.Person.create({id: 2, firstName: 'Jimmy', lastName: 'Jones', age: 8, married: false})      ];
      GLOBAL.p = p;

      var fs = [
        { name: 'Class', pause: true, factory: multiline(function() {/*
var p = this.Person.create({
   id: 1,
   firstName: 'John',
   lastName: 'Smith',
   age: 42,
   married: true
});
        */}) },
        { name: '.hashCode()', factory: multiline(function() {/*
> p.hashCode();
< 343020328
> p.firstName = 'Steve';
< "Steve"
> p.hashCode();
< 1609175968
*/}) },
        { name: '.copyFrom()' },
        { name: '.clone()' },
        { name: '.equals()' },
        { name: '.compareTo()' },
        { name: 'Observer' },
        { name: 'XML', factory: multiline(function() {/*
> p.toXML();
< "<foam>
<object model="Person">
  <property name="id">1</property>
  <property name="firstName">John</property>
  <property name="lastName">Smith</property>
  <property name="age">42</property>
  <property name="married">true</property>
</object>
</foam>"
*/}) },
        { name: 'JSON',  factory: multiline(function() {/*
> p.toJSON();"
< "{
   model_: "foam.demos.modeldiagram.Person",
   "id": 1,
   "firstName": "John",
   "lastName": "Smith",
   "age": 42,
   "married": true
}"*/})  },
        { name: 'ProtoBuf' },
        { name: 'Detail View', factory: function() { return self.DetailView.create({data:p, showActions:true}); } },
        { name: 'MD View', factory: function() { return self.MDDetailView.create({data:p}); } },
        { name: 'Table View', factory: function() { return self.TableView.create({model:self.Person, dao: people}); } },
        { name: 'List View' },
        { name: 'Help View', factory: function() { return self.HelpView.create({model:Model}); } },
        { name: 'Grid View', factory: function() { return { toHTML: function() { return '<img class="shadow0515" style="border:1px solid;max-height:510px" width="35%" src="./js/foam/demos/modeldiagram/WarpedGrid.png">'; }, initHTML: function() { }}; } },
        { name: 'Query' },
        { name: 'Local Store' },
        { name: 'ClientDAO' },
        { name: 'ServerDAO' },
        { name: 'IndexedDB' },
        { name: 'Offline' },
        { name: 'FileDAO' },
        { name: 'MongoDB' },
        { name: 'Postgres' },
        { name: 'Cloud Store' },
        { name: 'Firebase' },
        { name: 'Controller', factory: function() { return { toHTML: function() { return '<img class="shadow0515" height="55%" style="margin-left: 100px;border:1px solid;max-height:510px" src="./demos/democat/GMail.png">'; }, initHTML: function() { }}; } },
        { name: 'UML', factory: function() { return self.DocDiagramView.create({data:self.Person}); }},
//        { name: 'Docs', factory: function() { return self.DocViewPicker.create({data:self.Person}); }},
        { name: '...' }
      ];

      // JS
      fs.forEach(function(f) { feature(f, anim, 0, 0, 0.5); });

      // Adapters
      anim.push([0]);
      anim.push([1000, function() {
        var r = 0;
        var cs = self.children.clone();
        for ( var j = 1 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) ) {
            c.oldX = c.x;
            c.oldY = c.y;
            c.scaleX = 0.5;
            c.scaleY = 0.5;
            c.x = 400*Math.cos(r) + 900 - c.width/4;
            c.y = 400*Math.sin(r) + 500 - c.height/4;
            console.log(c.x, c.y);
            r += 2*Math.PI/30;
          }
        }
      }]);

      anim.push([0]);
      var adapter = self.Circle.create({color: 'pink', border: 'gray', x:900, y:500, alpha: 0, radius: 0});
        self.addChildren(adapter);
      anim.push([1000, function() {
        adapter.r = 320;
        adapter.alpha = 0.35;
      }]);

      anim.push([0]);
      anim.push([500, function() {
        self.removeChild(adapter);
        var cs = self.children.clone();
        for ( var j = 1 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) ) {
            c.x = c.oldX;
            c.y = c.oldY;
            c.scaleX = c.scaleY = 1;
          }
        }
      }]);


      anim.push([500, function() {
        var cs = self.children.clone();
        for ( var j = 1 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) ) {
            c.x = c.oldX;
            c.y = c.oldY;
            c.scaleX = c.scaleY = 1;
          }
        }
      }]);


      // Java
      anim.push([0]);
      fs.forEach(function(f) { f.factory = false; f.pause = false; });
      fs[0].factory = self.JavaSource.create().generate(self.Person);
      anim.push([500, function() { self.scaleX = self.scaleY = 0.7; }]);
      fnum = 0;
      fs.forEach(function(f) { feature(f, anim, 900, 0, 0.2); });

      // Swift
      anim.push([0]);
      fs[0].factory = self.SwiftSource.create().generate(self.Person);
      anim.push([500, function() { self.scaleX = self.scaleY = 0.65 * 0.65; }]);
      fnum = 0;
      fs.forEach(function(f) { feature(f, anim, 1800, 0, 0.15); });

      // Unit Tests
      anim.push([0]);
      anim.push(function() {
        var cs = self.children.clone();
        for ( var j = 0 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) ) {
            if ( c.text !== 'Model') {
              c = self.Box.create({alpha: 0, text: 'Unit Test', x: c.x+15, y: c.y-15, width: c.width, height: c.height, color: c.color, font: c.font, background: 'pink'});
              self.addChildren(c);
            }
          }
        }
      });
      anim.push([1000, function() {
        var cs = self.children.clone();
        for ( var j = 0 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) && c.text === 'Unit Test') c.alpha = 0.25;
        }
      }]);

      anim.push([0]);
      anim.push([1000, function() {
        var cs = self.children.clone();
        for ( var j = 0 ; j < cs.length ; j++ ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) && c.text === 'Unit Test' ) self.removeChild(c);
        }
      }]);

      // Other
      anim.push([0]);
      var anim2 = [];
      anim.push(anim2);
      for ( var i = 0 ; i < 3 ; i++ ) {
        var anim3 = [];
        anim2.push(anim3);
        fs.forEach(function(f) { f.factory = false; f.pause = false; });
        fnum = 0;
        fs.forEach(function(f) { feature(f, anim3, 900*i, 1000, 0.15); });
      }

      anim.push([0]);
      anim.push(function() { robot.timer.stop(); robot.timer.i = 45; robot.timer.time = 0; });
      anim.push(function() {
        var cs = self.children.clone();
        for ( var i = 1 ; i < 15 ; i++ ) {
          setTimeout(function(i) {
          for ( var j = 0 ; j < cs.length ; j++ ) {
            var c = cs[j];
            if ( self.Box.isInstance(c) ) {
              if ( c.text === 'Class' || c.text === 'Model' || Math.random() < 0.5 ) {
                c = self.Box.create({text: c.text, font: c.font, x: c.x-7*i, y: c.y+6*i, width: c.width, height: c.height, color: c.color, background: c.background});
                self.addChildren(c);
              }
            }
          }
          }.bind(self, i), i * 150);
        }
      });

      anim.push([0]);
      anim.push(function() {
        var cs = self.children;
        for ( var j = cs.length-1 ; j > -1 ; j-- ) {
          var c = cs[j];
          if ( self.Box.isInstance(c) && ( c.x > 1295 || c.y > 765 ) ) self.removeChild(c);
        }
      });
      anim.push([1000, function() { robot.scaleX += 0.0001; self.scaleX = self.scaleY = 1; }]);
      anim.push([0]);
      anim.push(function() { self.removeChild(robot); self.addChildren(robot); });
      anim.push([1000, function() { robot.x = v.x-25; robot.y += 35; }]);
      anim.push([0]);
      anim.push([800, function() { robot.scaleX = robot.scaleY = 25; }]);
      anim.push([0]);
      anim.push([800, function() { robot.scaleX = robot.scaleY = 3; }]);

      anim.push([0]);
      anim.push(function() { self.removeChild(v); self.addChildren(v); });
      anim.push([1000, function() { v.scaleX = v.scaleY = 5; }]);
      anim.push([0]);
      anim.push(function() { self.removeChild(v); self.addChildren(v); v.font = '18pt Arial'; v.text = "Class Model"; });
      anim.push([0]);
      anim.push(function() { v.text = "Query Model"; });
      anim.push([0]);
      anim.push(function() { v.text = "Parser Model"; });
      anim.push([0]);
      anim.push(function() { v.font = '12pt Arial'; v.text = "Concurrency Model"; });
      anim.push([0]);
      anim.push(function() { v.font = '14pt Arial'; v.text = "Animation Model"; });
      anim.push([0]);
      anim.push(function() { v.font = '18pt Arial'; v.text = "Kiosk Model"; });
      anim.push([0]);
      anim.push(function() { v.alpha = 0; });

      /*
      // Your Stack Here
      anim.push([0]);
      var ys1 = self.Box.create({x: 1550, y: 1060, width: 660, height: 850, scaleX: 0, scaleY: 0, font: '50pt Arial', text: 'Your Stack Here'});
      var ys2 = self.Box.create({x: 1550, y: 1060, width: 0, height: 0, font: '50pt Arial'});
      var ys3 = self.Box.create({x: 1550, y: 1060, width: 0, height: 0, font: '50pt Arial'});
      var ys4 = self.Box.create({x: 1550, y: 1060, width: 0, height: 0, font: '50pt Arial'});
      this.addChildren(ys4, ys3, ys2, ys1);
      anim.push([300, function() { ys1.scaleX = ys1.scaleY = 1; }]);
      anim.push([300, function() { ys2.width = 660; ys2.height = 850; ys2.x += 40; ys2.y-=40;}]);
      anim.push([300, function() { ys3.width = 660; ys3.height = 850; ys3.x += 80; ys3.y-=80;}]);
      anim.push([300, function() { ys4.width = 660; ys4.height = 850; ys4.x += 120; ys4.y-=120;}]);
      */

//      anim.push([500, function() { self.scaleX = self.scaleY = 1; }]);

      Movement.compile(anim)();
    },
    setDisplay: function(txt) {
      if ( typeof txt === 'function' ) {
        var v = txt();
        var t = txt.toString();
        t = t.length < 80 ? t.substring(26, t.length-2) : '';
        this.X.$('display').innerHTML = '<div style="font-size:24px">' + t + '</div><br><br>' + v.toHTML();
        v.initHTML();
      } else {
        this.X.$('display').innerHTML = txt ? '<textarea style="font-size:24px" rows="13" cols="77">' + txt + '</textarea>' : '';
      }
    }
  }
});
