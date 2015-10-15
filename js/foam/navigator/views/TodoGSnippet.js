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
  name: 'TodoGSnippet',
  package: 'foam.navigator.views',
  extends: 'foam.navigator.views.GSnippet',

  requires: [
    'foam.navigator.views.GSnippetMetadata',
    'foam.navigator.views.GSnippetMetadatum'
  ],

  properties: [
    {
      name: 'title',
      defaultValueFn: function() {
        return this.data && this.data.name || 'Todo';
      }
    },
    {
      name: 'metadata',
      view: 'foam.navigator.views.GSnippetMetadata',
      defaultValueFn: function() {
        if ( ! this.data ) return [];
        var basicMetadata = this.data.labels.map(function(label) {
          return this.GSnippetMetadatum.create({ text: label });
        }.bind(this));
        var todoMetadata = [
          this.GSnippetMetadatum.create({ text: 'Priority: ' + this.data.priority})
        ];
        if ( this.data.dueDate )
          todoMetadata = todoMetadata.concat([
            this.GSnippetMetadatum.create({ text: 'Due date: ' + this.data.dueDate })
          ]);
        return todoMetadata.concat(basicMetadata);
      }
    },
    {
      name: 'snippet',
      defaultValueFn: function() {
        return this.data && (
            this.data.name + (this.data.notes ? (': ' + this.data.notes) : '')
            ) || '';
      }
    }
  ]
});
