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
    'foam.ui.DetailView',
    'foam.graphics.Turntable',
    'foam.input.Mouse',
    'foam.demos.graphics.Dragon',
    'foam.ui.SlidePanel'
  ],

  exports: [ 'timer' ],

  properties: [
    {
      name: 'dragonModel',
      view: 'foam.ui.DetailView',
      factory: function() { return this.Dragon; }
    },
    {
      name: 'dragon',
      factory: function() { return this.Dragon.create({scaleX: 0.7, scaleY: 0.7, x: 1000}); }
    },
    {
      name: 'timer',
      view: 'foam.ui.DetailView',
      factory: function() { return Timer.create(); }
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
    }
  },

  templates: [
    function CSS() {/*
      span[name="sourcePath"] {
        font-size: smaller;
        margin-left: 12px;
      }
      .detailView .label {
        color: #444;
        font-size: smaller;
      }
      .panel .detailView {
        width: 820px;
      }
      .main .dragon-cell canvas {
        margin-top: -150px;
      }
    */},
    function toHTML() {/*
    <foam model="foam.ui.SlidePanel" minWidth="1700" minPanelWidth="850" side="left" XXXstripWidth="16">
      <panelView>
        <div style="background:cadetblue;overflow: auto;">
          $$dragonModel
        </div>
      </panelView>
      <mainView>
        <table style="margin-left: 16px">
          <tr>
            <td valign="top" width="700">$$timer{showActions: true}<br><%= this.data.turntable %></td>
            <td valign="top" class="dragon-cell"><%= this.data.dragon %></td>
          </tr>
        </table>
      </mainView>
     </foam>
    */}
  ]
});
