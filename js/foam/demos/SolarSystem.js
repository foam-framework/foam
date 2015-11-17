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
  name: 'SolarSystem',
  extends: 'foam.ui.View',

  requires: [
    'foam.demos.ClockView',
    'foam.demos.graphics.EyeCView',
    'foam.demos.graphics.EyesCView',
    'foam.graphics.CView',
    'foam.graphics.Circle as Planet',
    'foam.graphics.Graph',
    'foam.graphics.PieGraph',
    'foam.graphics.Turntable',
    'foam.ui.BooleanView',
    'foam.ui.DetailView',
    'foam.util.Timer'
  ],

  properties: [
    { name: 'space', factory: function(){ return this.CView.create({ width: 800, height: 600, background: '#000'}); } },
    {
      name: 'timer',
      view: { factory_: 'foam.ui.DetailView', showActions: true },
      factory: function() { return this.Timer.create(); }
    },
    { name: 'turntable', factory: function() { return this.Turntable.create(); } },
    { name: 'turntableView'},
    {
      name: 'sun',
      view: { factory_: 'foam.ui.DetailView', showActions: true }
    },
    'venus',
    {
      name: 'earth',
      view: { factory_: 'foam.ui.DetailView', showActions: true }
    },
    'moon', 'apollo', 'mars', 'mmoos'
  ],

  methods: {
    init: function() {
      this.sun    = this.Planet.create({r:30,x:400,y:300,color:'yellow'});
      this.venus  = this.Planet.create({r:6, color: 'green'});
      this.earth  = this.Planet.create({r:10, color: 'blue'});
      this.moon   = this.Planet.create({r:5, color:'lightgray'});
      this.apollo = this.Planet.create({r:3, color:'white'});
      this.mars   = this.Planet.create({r:8, color: 'red'});
      this.mmoons = [
        this.Planet.create({r:2, color: 'red'}),
        this.Planet.create({r:3, color: 'red'}),
        this.Planet.create({r:4, color: 'red'})
      ];
      this.space.addChild(this.sun);
      this.space.addChild(this.venus);
      this.space.addChild(this.earth);
      this.space.addChild(this.moon);
      this.space.addChild(this.apollo);
      this.space.addChild(this.mars);

      Movement.orbit(this.timer,   this.sun,   this.venus,  80,  2007);
      Movement.orbit(this.timer,   this.sun,   this.earth, 160,  6011);
      Movement.orbit(this.timer,   this.sun,   this.mars, 260, 10007);
      Movement.orbit(this.timer,   this.earth, this.moon,  50,  2049);
      Movement.orbit(this.timer,   this.moon,  this.apollo,  10,  1513);

      for ( var i = 0 ; i < this.mmoons.length ; i++ ) {
        this.space.addChild(this.mmoons[i]);
        Movement.orbit(this.timer, this.mars, this.mmoons[i], 30+i*10, 1500+500*i);
      }

      var clock = this.ClockView.create({x:700,y:90,r:80,color:'red'});
      this.space.addChild(clock);

 //     var eye = this.EyeCView.create({x:60,y:60,r:50,color:'red'});
      var eye = this.EyeCView.create({x:800,y:670,r:50,color:'red'});
      this.space.addChild(eye);
      eye.watch(this.mars);

      var graph = this.Graph.create({x:10,y:450,width:200,height:100,axisColor:'white',data:[1,2,3,4,5,4,3,2,1,4,6,8,10]});
      this.space.addChild(graph);
      graph.watch(this.apollo.y$);

      var pie = this.PieGraph.create({
        lineColor: 'white',
        groups: { Bananas: 9, Apples: 6, Oranges: 4 },
        r:50, x:20, y:250
      });
      this.space.addChild(pie);

//      var eyes = this.EyesCView.create({x:600,y:470});
      var eyes = this.EyesCView.create({x:1,y:1});
      this.space.addChild(eyes);
      eyes.watch(this.mars);

      this.turntableView = this.turntable.toView_();
      Events.link(this.timer.time$, this.turntable.time$);
    },

    initHTML: function() {
      this.SUPER();
      this.timer.start();
      this.turntableView.initHTML();
    }
  },

  templates: [
    function toHTML() {/*
      <table><tr><td valign="top"><%= this.space %></td>
      <td valign="top" style="padding-left:50px;">$$timer</td>
      <td valign="top">$$sun</td>
      </tr></table><div style="margin-top:-50px;margin-left:320px;"><%= this.turntableView.toHTML() %></div>
    */}
  ]
});
