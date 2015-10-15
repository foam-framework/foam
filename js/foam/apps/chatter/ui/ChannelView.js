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
  package: 'foam.apps.chatter.ui',
  name: 'ChannelView',
  extends: 'foam.ui.View',
  requires: [
    'foam.apps.chatter.Message'
  ],
  imports: [
    'nickname$ as name'
  ],
  properties: [
    {
      name: 'orderedMessages',
      factory: function() {
        return this.data.messages.orderBy(this.Message.TIMESTAMP);
      }
    },
    {
      name: 'input',
      postSet: function(_, value) {
        if ( value ) {
          this.data.messages.put(
            this.Message.create({
              content: value,
              from: this.name.get()
            }));
          this.input = '';
        }
      }
    }
  ],
  templates: [
    { name: 'toHTML' }
  ]
});
