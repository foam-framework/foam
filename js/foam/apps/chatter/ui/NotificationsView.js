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
  name: 'NotificationsView',
  imports: [
    'messageDAO',
    'clientView',
    'nickname$ as name'
  ],
  properties: [
    {
      name: 'messageDAO',
      postSet: function(old, nu) {
        if ( old ) old.unlisten(this.listener);
        if ( nu ) nu.listen(this.listener);
      }
    },
    {
      name: 'listener',
      factory: function() {
        var self = this;
        return {
          put: function(m) {
            if ( Notification.permission != 'granted' ) return;

            if ( m.content.indexOf(self.name.get()) != -1 ) {
              var n = new Notification(m.from + ': ' + m.content);
              n.onclick = function() {
                self.clientView.openChannel(m.channelId);
              };
            }
          }
        }
      }
    }
  ],
  methods: [
    function init() {
      Notification.requestPermission(function() {});
    },
  ]
});
