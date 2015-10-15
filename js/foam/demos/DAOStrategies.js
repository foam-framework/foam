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
  extends: 'foam.graphics.CView',

  requires: [
    'foam.graphics.CView',
    'foam.graphics.ImageCView',
    'foam.graphics.Label2',
    'foam.graphics.LabelledBox',
    'foam.input.Mouse'
  ],

  constants: {
    H: 40,

    COLOURS: {
      'Google Cloud': 320,
      'Local Storage': 320,
      'Array': 320,
      'MongoDB': 320,
      'Chrome Storage': 320,
      'Sync Storage': 320,
      'JSONFile': 320,
      'IndexedDB': 320,
      'REST Server': 14,
      'REST Client': 14,
      Migration: 225,
      Logging: 225,
      Timing: 225,
      SeqNo: 225,
      GUID: 225,
      Validating: 225,
      Caching: 120,
      Sync: 120,
//      'Business Logic': 225
    },

    STRATEGIES: [
      [ 'Local Storage' ],
      [ 'IndexedDB' ],
      [ 'IndexedDB', 'Caching' ],
      [ 'Array' ],
      [ 'Chrome Storage' ],
      [ 'Sync Storage' ],
      [ 'Server', '', 'Adapter' ],
      [ 'MongoDB', 'REST Server', '', 'REST Client' ],
      [ 'JSONFile', 'REST Server', '', 'REST Client' ],
      [ 'Google', '', 'Google Cloud' ],
      [ 'Server', '', 'Client', 'Caching' ],
      [ 'Server', '', 'Client', 'Sync' ],
      [ '???', 'SeqNo' ],
      [ '???', 'GUID' ],
      [ '???', 'Logging' ],
      [ '???', 'Timing' ],
      [ '???', 'Validating' ],
      [ '???', 'Migration' ],
      [ '???', 'Your Decorator' ],
      [ '???', 'Business Logic' ],
      [ '???' ]
    ]
  },

  properties: [
    { name: 'width',  defaultValue: 1800 },
    { name: 'height', defaultValue: 1100 },
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

      var S = this.STRATEGIES;

      this.addChild(this.ImageCView.create({
        x: 1530,
        y: 380,
        width: 200,
        height: 200,
        src: './js/foam/demos/empire/todo.png'
      }));

      for ( var i = 0 ; i < S.length ; i++ )
        this.addChild(this.makeStrategyView(S[i], i));

      this.mouse.connect(this.view.$);
      this.mouse.y$.addListener(function(_, y) {
        this.view.paint();
      }.bind(this));
    },

    makeStrategyView: function(s, i) {
      var v = this.CView.create({
        width: 500,
        height: 32,
        x: 1400,
        y: 30 + this.H * i
      });

      for ( var j = 0 ; j < s.length ; j++ ) {
        var t = s[j];
        var c = this.COLOURS[t];
        v.addChild(this.LabelledBox.create({
          font: '18px Arial',
          background: c ? 'hsl(' + c + ',70%,90%)' : 'white',
          x: -140 * (s.length - j),
          y: ! t ? 16 : 0,
          width:  140,
          height: ! t ? 1 : 32,
          text:   t
        }));
      }

      this.mouse.y$.addListener(function() {
        var y = 30 + this.H * i;
        var y2 = this.warp(y);
        var h2 = this.warp(y+32) - y2;
        v.y = y2;
        v.scaleX = v.scaleY = h2/32;
      }.bind(this));

      return v;
    },

    warp: function(y) {
      if ( this.mouse.y < 20 ) return y;
      var D  = 1400;
      var d  = y-this.mouse.y;
      var ad = Math.abs(d);
      if ( ad > D ) return y;
      var nd = ad / D;
      nd = Math.min(1, Math.pow(1-nd, 4));
      return this.mouse.y + d * ( 1 + nd*1.5 );
    }
  }
});
