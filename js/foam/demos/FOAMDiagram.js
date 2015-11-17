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
  extends: 'foam.graphics.CView',

  requires: [
    'foam.ui.DetailView',
    'foam.graphics.CView',
    'foam.graphics.LabelledBox as Box',
    'foam.graphics.Label2 as Label',
    'foam.graphics.Circle'
  ],

  properties: [
    [ 'x',          50      ],
    [ 'y',          50      ],
    [ 'width',      1500    ],
    [ 'height',     750     ],
    [ 'background', 'black' ]
  ],

  methods: {
    initCView: function() {
      var self = this;
      function box(m) {
        m.color = m.color || 'blue';
        m.background = m.background || 'white';
        m.font = 'bold ' + (m.font || 22 ) + 'pt Arial';
        m.alpha = m.alpha || 0;

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

      var foam = box({text: 'FOAM', font: 60, width: this.width-2, height: this.height, x: 0, y: 0, alpha: 1});
        var modeler        = box({text: 'Modeler', font: 36});
          var ani          = box({text: 'Animations'});
          var parse        = box({text: 'Parsers'});
          var query        = box({text: 'Queries'});
          var concur       = box({text: 'Concurrency'});
          var doc          = box({text: 'Interactive Documents'});
          var models       = box({text: '...'});
          var otherm       = box({text: 'Classes'});
            var mp         = box({text: 'Traits',        font: 20});
            var mm         = box({text: 'Dependencies',  font: 20});
            var ma         = box({text: 'Type-Checking', font: 20});
            var ml         = box({text: 'Reflection',    font: 20});
            var mt         = box({text: 'Packages',      font: 20});
            var md         = box({text: '...'});
        var lib            = box({text: 'Library',       font: 36});
          var c            = box({text: 'Client'});
            var android    = box({text: 'Android'});
            var web        = box({text: 'Web'});
              var model    = box({text: 'Model'});
                var m1     = box({text: 'Local'});
                var m2     = box({text: 'REST'});
                var m3     = box({text: 'Offline'});
                var m4     = box({text: 'Query'});
              var view     = box({text: 'View'});
                var dom    = box({text: 'DOM',           font: 28});
                var canvas = box({text: 'Canvas',        font: 28});
                var webgl  = box({text: 'WebGL',         font: 28});
                var v1     = box({text: 'Reactivity',    font: 28});
                var v2     = box({text: 'Animation',     font: 28});
                var v3     = box({text: 'Physics',       font: 28});
              var ctrl     = box({text: 'Controller'});
            var ios        = box({text: 'iOS'});
          var s            = box({text: 'Server'});
            var node       = box({text: 'Node.js'});
            var java       = box({text: 'Java'});
            var other      = box({text: '...'});

      var click = this.Label.create({text: '(keep clicking)', background: null, align: 'center', font: '20pt Arial', color: 'blue', width: this.width, height: 100, y: 420});
      this.addChild(click);

      children(foam, [modeler, lib], true);
      children(modeler, [otherm, ani, parse, query, concur, doc, models], true);
      children(lib, [c, s], false);
      children(c, [android, web, ios], true);
      children(s, [node, java, other], false);
      children(web, [model, view, ctrl], false);
      children(view, [canvas, dom, webgl], true);
      children(view, [v1, v2, v3], true);
      children(otherm, [mt, mp, mm, ma, ml, md]);
      children(model, [m1,m2,m3,m4], true);

      var M = Movement;
      var B = M.bounce(0.2, 0.08, 3);

      M.compile([
        [0],
        function () { click.width = 0; },
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
        [500, function() { m1.alpha = m2.alpha = m3.alpha = m4.alpha = 1; }],
        [0],
        [500, function() { dom.alpha = canvas.alpha = webgl.alpha = 1; }],
        [0],
        [500, function() { v1.alpha = v2.alpha = v3.alpha = 1; }],
        [0],
        [500, function() {
          v1.scaleX = v2.scaleX = v3.scaleX = dom.scaleX = canvas.scaleX = webgl.scaleX = 0.5;
          v1.x += v1.width/2;
          v2.x += v2.width/2;
          v3.x += v3.width/2;
        }],
        [0],
        [500, function() { mp.alpha = mm.alpha = ma.alpha = ml.alpha = mt.alpha = md.alpha = 1; }],
        [0],
        function() { dom.color = 'red'; }
      ])();
    }
  }
});
