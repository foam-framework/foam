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
  name: 'EMailGSnippet',
  package: 'foam.navigator.views',
  extends: 'foam.navigator.views.GSnippet',

  properties: [
    {
      name: 'title',
      lazyFactory: function() {
        return this.data.subject || this.data.snippet || this.data.from;
      }
    },
    {
      name: 'snippet',
      lazyFactory: function() {
        return this.data.snippet;
      }
    },
    {
      name: 'url',
      lazyFactory: function() {
        return 'https://mail.google.com/mail/u/0#inbox/' + this.data.id.split(':')[1]
      }
    },
    {
      name: 'metadata',
      lazyFactory: function() {
        return [
          this.GSnippetMetadatum.create({ label: 'From', text: this.data.from }),
          this.GSnippetMetadatum.create({ label: 'Date', text: this.data.timestamp.toString() }),
          this.GSnippetMetadatum.create({ label: 'Labels', text: this.data.labels.join(',') })
        ];
      }
    }
  ]
});
