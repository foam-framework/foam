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
    'foam.demos.graphics.Dragon'
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
      factory: function() { return this.Dragon.create(); }
    },
    {
      name: 'timer',
      view: 'foam.ui.DetailView',
      factory: function() { return Timer.create(); }
    },
    {
      name: 'turntable',
      factory: function() { return this.Turntable.create(); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.turntable.time$ = this.timer.time$;
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
      .detailView {
        width: 50%;
      }
      .actionToolbar {
        width: 25%;
        position: absolute;
      }
    */},
    function toHTML() {/*
      <table border="1">
        <tr>
          <td rowspan="2" width="700">$$dragonModel</td>
          <td valign="top" width="300">$$timer{showActions: true}</td>
          <td>%%turntable</td>
        </tr>
        <tr>
          <td colspan="2">%%dragon</td>
        </tr>
      </table>
    */}
  ]
});
