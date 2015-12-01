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
  name: 'ModelingDiagram',
  extends: 'foam.graphics.CView',

  requires: [
    'foam.ui.DetailView',
    'foam.util.Timer',
    'foam.graphics.CView',
    'foam.graphics.LabelledBox as Box',
    'foam.graphics.Circle'
  ],

  properties: [
    [ 'width', 1500 ],
    [ 'height', 1400 ],
    [ 'background', 'black' ],
    {
      name: 'timer',
      view: { factory_: 'foam.ui.DetailView', showActions: true },
      factory: function() { return this.Timer.create(); }
    }
  ],

  methods: {
    initCView: function() {
      var language  = this.Box.create({color: 'white', text: "Language",    background: 'green',  width: 600, height: 50,  x:500, y: 500,  font: '22pt Arial'});
      var problem   = this.Box.create({color: 'white', text: "Problem",     background: 'green',  width: 600, height: 50,  x:-610, y: 100, font: '22pt Arial'});
      var solution  = this.Box.create({color: 'white', text: "Solution",    background: 'brown',  width: 600, height:  0,  x:500, y: 500, font: '22pt Arial'});
      var l1        = this.Box.create({color: 'white', text: "Library 1",   background: 'blue',   width: 600, height: 50,  x:-610, font: '22pt Arial'});
      var l2        = this.Box.create({color: 'white', text: "Framework 1", background: 'blue',   width: 600, height: 50,  x:-610, font: '22pt Arial'});
      var l3        = this.Box.create({color: 'white', text: "Library 2",   background: 'blue',   width: 600, height: 50,  x:-610, font: '22pt Arial'});
      var l4        = this.Box.create({color: 'white', text: "Framework 2", background: 'blue',   width: 600, height: 50,  x:-610, font: '22pt Arial'});
      var l5        = this.Box.create({color: 'white', text: "...",         background: 'blue',   width: 600, height: 50,  x:-610, font: '22pt Arial'});
      var model     = this.Box.create({color: 'white', text: "Model",       background: 'brown',  width: 600, height: 50,  x:-610, font: '22pt Arial'});

      this.addChildren(
        language, problem, solution, l1, l2, l3, l4, l5, model
      );

      var M = Movement;
      var B = M.bounce(0.2, 0.08, 3);

      M.compile([
        [1000],
        [2000, function() { problem.x = 500;  }, M.easeIn(0.3).o(M.oscillate(0.3, 0.02, 2))],
        [5000, function() { solution.height = 350; solution.y -= 350; }, M.accelerate.o(M.bounce(0.2, 0.05, 2))],
        [2000],
//        [5000, function() { l1. }, M.accelerate.o(M.bounce(0.2, 0.05, 2))],
        /*
        [1000],
        [
          [2900, function() { reactive.x = 750; reactive.a = Math.PI*2; }, M.easeOut(1.0)],
          [3000, function() { reactive.y = 700; }, M.easeIn(1.0)]
        ],
        [1000],
        [1500, function() { animation.x = 600; animation.y = 650;}],
        [ 500],
        [ 700, function() { animation.x = 750;}],
        [1000],
        function() { timer.start(); },
        [1500, function() { V.x = 850; }],
        [1500, function() { V.y = 550; }],
        function() { timer.stop(); },
        [1000, function() { m.x = 750; m.y = 550; m.width = 100; m.height=100; C.x = 950; C.y = 550; C.width=100; C.height=100; }],
        [1000],
        [2000, function() { meta.a = 0; meta.x = 750; meta.y = 450;}],
        [1000],
        [1500, function() { ime.y -= 100; ime.height += 100; }],
        [1000],
        [
          [5000, function() { meta.width += 250; }],
          [[1000], [2000, function() { java.height = 300; }, B]],
          [[2000], [2000, function() { dart.height = 300; }, B]],
          [[3000], [2000, function() { cpp.height = 300; }, B]],
          [[5000], [2000, function() { future.height = 300; }, B]]
        ],
        [1000],
        [1000, function() { dev.y = 350-dev.r; }, M.accelerate.o(M.bounce(0.2, 0.15, 2))],
        [1000, function() {
          var s = 50;
          var w = 6*s;
          js.x        -= w;     js.width        += w;   w-=s;
          events.x    -= w;     events.width    += w;   w-=s;
          reactive.x  -= w;     reactive.width  += w;   w-=s;
          animation.x -= w;     animation.width += w;   w-=s;
          m.x         -= w;     m.width         += w/3;
          V.x         -= w*2/3; V.width         += w/3;
          C.x         -= w/3;   C.width         += w/3; w-=s;
          meta.x      -= w;     meta.width      += w;   w-=s;
        }, B],
        [9000, function() { dev.x = 475; }, M.ease(0.2, 0.2)],
        */
      ])();
    },

    // TODO: Make a trait
    paintChildren: function(canvas) {
      // paint children inverted and slated below reflection point
      canvas.save();
      canvas.translate(850*0.6,850);
      canvas.scale(1,-1);
      canvas.translate(0,-850);
      canvas.transform(1,0,-0.6,1,0,0);

      this.SUPER(canvas);

      // cause fading with white gradient
      var fade = canvas.createLinearGradient(0,750,0,-1000);
      fade.addColorStop(0,   'rgba(255,255,255,0.82)');
      fade.addColorStop(0.2, 'rgba(255,255,255,1)');
      fade.addColorStop(1,   'rgba(255,255,255,1)');
      canvas.fillStyle = fade;
      canvas.fillRect(0, 850, 1500, -1000);
      canvas.restore();

      // paint children in normally
      this.SUPER(canvas);
    }
  }
});
