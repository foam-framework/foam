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
  name: 'DragonLiveCoding',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.demos.graphics.Dragon',
    'foam.graphics.Turntable',
    'foam.input.Mouse',
    'foam.ui.DetailView',
    'foam.ui.SlidePanel',
    'foam.ui.DAOListView',
    'foam.util.Timer'
  ],

  exports: [ 'timer' ],

  properties: [
    {
      name: 'dragon',
      factory: function() { return this.Dragon.create({x: 550, blowBubbles: false}); }
    },
    {
      name: 'timer',
      view: 'foam.ui.DetailView',
      factory: function() { return this.Timer.create(); }
    },
    {
      name: 'turntable',
      factory: function() { return this.Turntable.create(); }
    },
    {
      name: 'mouse',
      factory: function() { return this.Mouse.create(); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.data = this;
    },
    initHTML: function() {
      this.SUPER();

      this.turntable.time$ = this.timer.time$;
      this.timer.start();
      this.mouse.connect(this.dragon.$);
      this.dragon.eyes.watch(this.mouse);

      var Dragon = foam.demos.graphics.Dragon;
      Dragon.methods.forEach(function(meth) {
        if ( meth.name === 'paintSelf' || meth.name === 'wing' || meth.name === 'feather' ) meth.code$.addListener(function() {
          // console.log(meth.name, typeof meth.code);
          try {
            Dragon.getPrototype()[meth.name] = meth.code;
          } catch (e) {
            console.log(e);
          }
        });
      });
    }
  },

  templates: [
    function CSS() {/*
      span[name="sourcePath"] {
        font-size: smaller;
        margin-left: 12px;
      }
      .panel .detailView {
        width: 820px;
      }
      .main .dragon-cell canvas {
        margin-top: -150px;
      }
    */},
    function toHTML() {/*
      <div style="display:flex;display:-webkit-flex;width:100%;flex: 1 1 1px;">
        <div style="width:45%">
          $$timer{showActions: true}<br><%= this.data.turntable %>
          <%= foam.ui.DAOListView.create({mode: 'read-only', dao: foam.demos.graphics.Dragon.methods.where({f:function(m) { return m.name === 'paintSelf' || m.name === 'wing' || m.name === 'feather'; }})}) %>
        </div>
        <div style="width:55%;margin-top:500px;">
          %%dragon
        </div>
      </div>
    */}
  ]
});
