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
  name: 'DAOStrategies',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.graphics.LabelledBox',
    'foam.graphics.ImageCView',
    'foam.input.Mouse',
    'foam.graphics.CView',
    'foam.graphics.Label2'
  ],

  constants: {
    COLOURS: [

    ],

    STRATEGIES: [
      [ 'Local Storage' ],
      [ 'IndexedDB' ],
      [ 'IndexedDB', 'Caching' ],
      [ 'IndexedDB', 'Cachinng', 'Migration' ],
      [ 'IndexedDB', 'Cachinng', 'Migration', 'SeqNo' ],
      [ 'IndexedDB', 'Cachinng', 'Migration', 'GUID'  ],
      [ 'Chrome Storage' ],
      [ 'Chrome Sync Storage' ],
      [ 'Array' ],
      [ 'Server', '', 'Adapter' ],
      [ 'MongoDB', 'REST Server', '', 'REST Client' ],
      [ 'JSONFile', 'REST Server', '', 'REST Client' ],
      [ 'Google Cloud', '-', 'Google Cloud Store' ],
      [ 'Server', '', 'Client', 'Caching' ],
      [ 'Server', '', 'Client', 'Sync' ],
      [ '???', 'Logging' ],
      [ '???', 'Timing' ],
      [ '???', '???' ],
      [ '???' ],
      /*
      [ '' ],
      [ '' ],
      [ '' ],
      [ '' ],
      [  ],
      */
    ]
  },

  properties: [
    { name: 'width',  defaultValue: 2000 },
    { name: 'height', defaultValue: 1000 },
    {
      name: 'mouse',
      transient: true,
      hidden: true,
      lazyFactory: function() { return this.Mouse.create(); }
    }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      var M = Movement;
      var S = this.STRATEGIES;
      var H = 80; // 1000 / ( S.length + 1 );
      var self = this;

      for ( var i = 0 ; i < S.length ; i++ ) {
        var v = this.makeStrategyView(S[i]);
        v.x = 700;
        v.y = 50 + H * i;
        this.addChild(v);
      }
      this.mouse.connect(this.view.$);
      this.mouse.y$.addListener(function(_, y) {
        self.view.paint();
//        app.y = Math.floor(self.mouse.y / H) * H;
      });
    },

    makeStrategyView: function(s) {
      var v = this.CView.create({width: 500, height: 550});

      v.addChild(this.ImageCView.create({
        x: 110,
        scaleX: 0.25,
        scaleY: 0.25,
        src: './js/foam/demos/empire/todo.png'
      }));

      for ( var i = 0 ; i < s.length ; i++ ) {
        v.addChild(this.LabelledBox.create({
          x: -100 * (s.length - i + -1),
          y: ! s[i] ? 25 : 0,
          width:  100,
          height: ! s[i] ? 1 : 50,
          text:   s[i]
        }));
      }

      return v;
    }
  }
});
