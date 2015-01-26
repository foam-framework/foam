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
  name: 'IssueConfig',
  package: 'foam.navigator',
  extendsModel: 'foam.navigator.BrowserConfig',
  requires: [
    'XHR',
    'foam.navigator.types.Issue',
    'foam.navigator.types.IssueGSnippetView'
  ],

  properties: [
    {
      name: 'name',
      defaultValue: 'IssueBrowser'
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.Issue; }
    },
    {
      name: 'dao',
      factory: function() {
        var future = afuture();
        var xhr = this.XHR.create();
        xhr.asend(function(data) {
          debugger;
          var dao = this.MDAO.create({ model: this.Issue });
          var parsed = JSONUtil.parse(data);
          parsed.dao.select(dao);
          future.set(dao);
        }.bind(this), '/apps/navigator/bugs.json');
        return this.FutureDAO.create({ future: future });
      }
    }
  ]
});
