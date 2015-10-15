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
  name: 'RegressionTestResultView',
  label: 'Regression Test Result View',
  documentation: 'Displays the output of a $$DOC{.ref:"RegressionTest"}, either master or live.',

  extends: 'foam.ui.UnitTestResultView',

  properties: [
    {
      name: 'masterView',
      defaultValue: 'RegressionTestValueView'
    },
    {
      name: 'liveView',
      defaultValue: 'RegressionTestValueView'
    },
    {
      name: 'masterID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'liveID',
      factory: function() { return this.nextID(); }
    }
  ],

  actions: [
    {
      name: 'update',
      label: 'Update Master',
      documentation: 'Overwrite the old master output with the new. Be careful that the new result is legit!',
      isEnabled: function() { return this.test.regression; },
      code: function() {
        this.test.master = this.test.results;
        this.test.regression = false;
        if ( this.X.testUpdateListener ) this.X.testUpdateListener();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
      <table id="<%= this.setClass('error', function() { return this.test.regression; }) %>">
        <tbody>
          <tr>
            <th>Master</th>
            <th>Live</th>
          </tr>
          <tr>
            <td class="output" id="<%= this.setClass('error', function() { return this.test.regression; }, this.masterID) %>">
              <% this.masterView = this.X.lookup(this.masterView).create({ data$: this.test.master$ }, this.Y); out(this.masterView); %>
            </td>
            <td class="output" id="<%= this.setClass('error', function() { return this.test.regression; }, this.liveID) %>">
              <% this.liveView = this.X.lookup(this.liveView).create({ data$: this.test.results$ }, this.X); out(this.liveView); %>
            </td>
          </tr>
        </tbody>
      </table>
      $$update
    */}
  ]
});
