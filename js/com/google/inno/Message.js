/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.google.inno',
  name: 'Message',
  traits: [
    'foam.core.dao.SyncTrait'
  ],
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'from',
      type: 'String'
    },
    {
      name: 'content',
      type: 'String'
    },
    {
      name: 'bucket',
      type: 'String'
    },
    {
      name: 'timestamp',
      type: 'DateTime',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'relevance',
      type: 'Int'
    }
  ],
  methods: [
    function toRowE(X) {
      return X.E('div')
        .start('span')
        .add('[', this.timestamp.getHours(), '-', this.timestamp.getMinutes(), '] ')
        .end('span')
        .add(this.from, ': ', this.content);
    }
  ]
});
