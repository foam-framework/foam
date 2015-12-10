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
  package: 'foam.apps.chatter',
  name: 'Message',
  traits: [
    'foam.core.dao.SyncTrait'
  ],
  properties: [
    {
      name: 'id',
      hidden: true,
      visibility: 'hidden'
    },
    {
      name: 'from',
      type: 'String',
      visiblity: 'final'
    },
    {
      name: 'content',
      type: 'String',
      visibility: 'final'
    },
    {
      name: 'channelId',
      type: 'Reference',
      visibility: 'hidden',
      hidden: true
    },
    {
      name: 'timestamp',
      type: 'DateTime',
      visibility: 'ro',
      factory: function() {
        return Date.now();
      }
    }
  ],
  methods: [
    function toE(X) {
      return X.E('span')
        .x({ data: this })
        .add(this.TIMESTAMP, this.FROM, this.CONTENT);
    }
  ]
});
