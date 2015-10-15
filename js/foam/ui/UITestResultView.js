/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name: 'UITestResultView',
  extends: 'foam.ui.UnitTestResultView',

  label: 'UI Test Result View',
  help: 'Overrides the inner masterView and liveView for UITests.',

  properties: [
    {
      name: 'liveView',
      getter: function() { return this.X.$(this.liveID); }
    },
    {
      name: 'liveID',
      factory: function() { return this.nextID(); }
    }
  ],

  methods: {
    preTest: function() {
      var test = this.test;
      var $ = this.liveView;
      test.append = function(s) { $.insertAdjacentHTML('beforeend', s); };
      test.X.render = function(v) {
        test.append(v.toHTML());
        v.initHTML();
      };
    }
  },

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
        <div class="output" id="<%= this.setClass('error', function() { return this.test.failed > 0; }, this.liveID) %>">
        </div>
      </div>
    */}
  ]
});
