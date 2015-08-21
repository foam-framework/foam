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
  name: 'FOAMDiagram',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.ui.DetailView',
    'foam.graphics.CView',
    'foam.graphics.LabelledBox as Box',
    'foam.graphics.Circle'
  ],

  properties: [
    { name: 'width',      defaultValue: 1010    },
    { name: 'height',     defaultValue: 810     },
    { name: 'background', defaultValue: 'black' }
  ],

  methods: {
    initCView: function() {
      var self = this;
      function box(m) {
        m.color = 'white';
        m.font = m.font || '22pt Arial';
        m.alpha = 0;
        m.background = '#aaa';

        var b = self.Box.create(m);
        self.addChild(b);
        return b;
      }
      function children(m, cs, vertical) {
        for ( var i = 0 ; i < cs.length ; i++ ) {
          var c = cs[i];

          if ( vertical ) {
            c.width  = m.width;
            c.height = m.height / cs.length;
            c.x      = m.x;
            c.y      = m.y + m.height / cs.length * i;
          } else {
            c.width  = m.width / cs.length;
            c.height = m.height;
            c.x      = m.x + m.width / cs.length * i;
            c.y      = m.y;
          }
        }
      }

      var foam    = box({text: 'FOAM', font: '60pt Arial', width: 1000, height: 800, x: 0, y: 0});
        var modeler = box({text: 'Modeler', font: '36pt Arial'});
          var ani       = box({text: 'Animations'});
          var parse     = box({text: 'Parsers'});
          var query     = box({text: 'Queries'});
          var concur    = box({text: 'Concurrency'});
          var doc       = box({text: 'Live Documents'});
          var otherm    = box({text: '...'});
          var models    = box({text: 'Models'});
            var mp = box({text: 'Classes', font: '16pt Arial'});
            var mm = box({text: 'Dependencies', font: '16pt Arial'});
            var ma = box({text: 'Type-Checking', font: '16pt Arial'});
            var ml = box({text: 'Reflection', font: '16pt Arial'});
            var mt = box({text: 'Packages', font: '16pt Arial'});
            var md = box({text: '...'});
//            var mr = box({text: 'Relationships'});
        var lib     = box({text: 'Library', font: '36pt Arial'});
          var c       = box({text: 'Client'});
            var android = box({text: 'Android'});
            var web     = box({text: 'Web'});
            var ios     = box({text: 'iOS'});
          var s       = box({text: 'Server'});
          var model       = box({text: 'Model'});
            var node       = box({text: 'Node.js'});
            var java       = box({text: 'Java'});
            var other      = box({text: '...'});
          var view       = box({text: 'View'});
            var dom       = box({text: 'DOM'});
            var canvas    = box({text: 'Canvas'});
            var webgl    = box({text: 'WebGL'});
          var ctrl       = box({text: 'Controller'});


      children(foam, [modeler, lib], true);
      children(modeler, [ani, parse, query, concur, doc, models, otherm], true);
      children(lib, [c, s], false);
      children(c, [android, web, ios], true);
      children(s, [node, java, other], false);
      children(web, [model, view, ctrl], false);
      children(view, [canvas, dom, webgl], true);
      children(otherm, [mt, mp, mm, ma, ml, md]);

      var M = Movement;
      var B = M.bounce(0.2, 0.08, 3);

      foam.alpha = 1;

      M.compile([
        [0],
        [500, function() { modeler.alpha = lib.alpha = 1; }],
        [0],
        [500, function() { ani.alpha = parse.alpha = query.alpha = concur.alpha = doc.alpha = models.alpha = otherm.alpha = 1; }],
        [0],
        [500, function() { c.alpha = s.alpha = 1; }],
        [0],
        [500, function() { node.alpha = java.alpha = other.alpha = 1; }],
        [0],
        [500, function() { android.alpha = web.alpha = ios.alpha = 1; }],
        [0],
        [500, function() { model.alpha = view.alpha = ctrl.alpha = 1; }],
        [0],
        [500, function() { dom.alpha = canvas.alpha = webgl.alpha = 1; }],
        [0],
        [500, function() { mp.alpha = mm.alpha = ma.alpha = ml.alpha = mt.alpha = md.alpha = 1; }],
        [0],
        function() { dom.background = 'red'; },
      ])();
    }
  }
});
