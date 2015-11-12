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
  package: 'foam.demos',
  name: 'ModelDiagram',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.demos.supersnake.Robot',
    'foam.ui.DetailView',
    'foam.graphics.CView',
    'foam.graphics.LabelledBox as Box',
    'foam.graphics.Circle'
  ],

  properties: [
    [ 'width', 1200/0.75 ],
    [ 'height', 800/0.75 ],
    [ 'scaleX', 1 ],
    [ 'scaleY', 1 ],
    [ 'background', 'gray' ]
  ],

  methods: {
    initCView: function() {
      var self  = this;
      var v     = this.Box.create({width: 500, height: 600, x:100, y: 120});
      var robot = this.Robot.create({x:400,y:180,width:200,height:220,scaleX:0,scaleY:0});

      this.addChildren(
        v, robot
      );

      var M = Movement;
      var B = M.bounce(0.2, 0.08, 3);

      var anim = [
        [0],
        [500, function() { v.width /= 5; v.height /= 5; } ],
        [500, function() { robot.scaleX = robot.scaleY = 3; } ],
        [0]
      ];

      var fnum = 0;
      function feature(n) {
        var f = self.Box.create({width: v.width/5, height: v.height/5, x: v.x, y: v.y, text: n});
        var num = fnum++;
        var x = num % 5;
        var y = Math.floor(num/5);

//        anim.push([[0]]);
        anim.push(function() { self.addChild(f); });
        anim.push([100, function() { f.x = robot.x; }]);
        anim.push([400, function() { f.x += 250; f.scaleX = f.scaleY = 6; }]);
//        anim.push([[0]]);
        anim.push([100, function() { f.scaleX = f.scaleY = 1; f.x += x * f.width*1.4; f.y += -80 + f.height*1.2 * y; }]);
      }

      feature('Class/Prototype');
      feature('.hashCode()');
      feature('.copyFrom()');
      feature('.clone()');
      feature('.deepClone()');
      feature('.equals()');
      feature('.compareTo()');
      feature('Observer Support');
      feature('XML Adapter');
      feature('JSON Adapter');
      feature('UML');
      feature('Detail View');
      feature('MD Detail View');
      feature('Table View');
      feature('Grid View');
      feature('mLang');
      feature('Query Parser');
      feature('Local Storage');
      feature('IndexedDB');
      feature('ClientDAO');
      feature('ServerDAO');
      feature('Offline Sync');
      feature('FileDAO');
      feature('MongoDB');
      feature('Postgres');
      feature('Google Cloud Store');
      feature('Firebase');
      feature('Controller');
      feature('...');
      feature('...');

      console.log(anim);
      M.compile(anim)();
    }
  }
});
