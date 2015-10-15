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
  name: 'UnitTestResultView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'test',
      defaultValueFn: function() { return this.parent.data; }
    }
  ],

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
      <pre>
        <div class="output" id="<%= this.setClass('error', function() { return this.parent.data.failed; }, this.id) %>">
        </div>
      </pre>
    */},
   function toInnerHTML() {/*
     <%= TextFieldView.create({ data: this.data, mode: 'read-only', escapeHTML: false }) %>
   */}
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      var self = this;
      this.preTest();
      this.test.atest()(function() {
        self.postTest();
        self.X.asyncCallback && self.X.asyncCallback();
      });
    },
    preTest: function() {
      // Override me to insert logic at the start of initHTML, before running the test.
    },
    postTest: function() {
      this.updateHTML();
      // Override me to insert logic after running this test.
      // Called asynchronously, after atest() is really finished.
    }
  }
});
