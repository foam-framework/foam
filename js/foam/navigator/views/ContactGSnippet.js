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
  name: 'ContactGSnippet',
  package: 'foam.navigator.views',
  extends: 'foam.navigator.views.GSnippet',
  properties: [
    {
      name: 'title',
      lazyFactory: function() { return this.data.title || this.data.email; }
    },
    {
      name: 'snippet',
      defaultValue: '',
    },
    {
      name: 'url',
      lazyFactory: function() {
        return 'https://www.google.com/contacts/u/0/?cplus=0#contact/' + this.data.id.split(':')[1];
      }
    },
    {
      name: 'metadata',
      lazyFactory: function() {
        return [
          this.GSnippetMetadatum.create({ label: 'EMail', text: this.data.email })
        ];
      }
    }
  ]
});
