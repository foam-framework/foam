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
    'foam.graphics.Label2'
  ],

  constants: {
    STRATEGIES: [
      [ 'Local Storage' ],
      [ 'IndexedDB' ],
      [ 'IndexedDB', 'Caching' ],
      [ 'Chrome Storage' ],
      [ 'Chrome Sync Storage' ],
      [ 'Array' ],
      [ 'Legacy' ],
      [ 'REST', 'REST Server', 'MongoDB' ],
      [ 'REST', 'REST Server', 'JSON File' ],
      [ 'Google Cloud Store' ],
      [ 'Caching' ],
      [ 'Sync' ],
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
      var H = 1000 / ( S.length + 1 );
      var self = this;
      var app = this.ImageCView.create({
        x: 1000,
        xxxscaleX: 0.2,
        xxxscaleY: 0.2,
        src: './js/foam/demos/empire/todo.png'
      });

      this.addChild(app);
      for ( var i = 0 ; i < S.length ; i++ ) {
        var v = this.makeStrategyView(S[i]);
        v.x = 300;
        v.y = H * i;
        this.addChild(v);
      }
      this.mouse.connect(this.view.$);
      this.mouse.y$.addListener(function(_, y) {
        app.y = Math.floor(self.mouse.y / H) * H;
      });
    },

    makeStrategyView: function(s) {
      return this.LabelledBox.create({
        width:  100,
        height: 50,
        text:   s[0]
      });
    }
  }
});
