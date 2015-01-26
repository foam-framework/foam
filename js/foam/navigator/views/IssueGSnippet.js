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
  name: 'IssueGSnippet',
  package: 'foam.navigator.views',
  extendsModel: 'foam.navigator.views.GSnippet',

  properties: [
    {
      name: 'title',
      lazyFactory: function() {
        console.log(this.data);
        return this.data && this.data.title;
      }
    },
    {
      name: 'snippet',
      lazyFactory: function() {
        return this.data && this.data.comment;
      }
    },
    {
      name: 'url',
      lazyFactory: function() {
        return 'https://b2.corp.google.com/issues/' + this.data.id;
      }
    },
    {
      name: 'metadata',
      lazyFactory: function() {
        return [
          this.GSnippetMetadatum.create({
            label: 'Status',
            text: this.data.status
          }),
          this.GSnippetMetadatum.create({
            label: 'Reporter',
            text: this.data.reporter
          }),
          this.GSnippetMetadatum.create({
            label: 'Assignee',
            text: this.data.assignee
          }),
          this.GSnippetMetadatum.create({
            label: 'CCs',
            text: this.data.cc.join(', ')
          })
        ];
      }
    }
  ]
});
