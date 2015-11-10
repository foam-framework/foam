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
  package: 'foam.core.dao.sync',
  name: 'PollingSyncDAO',
  extends: 'foam.core.dao.SyncDAO',
  help: 'Polling based sync strategy, calls sync periodically.',
  imports: [
    'setTimeout',
    'clearTimeout'
  ],
  properties: [
    {
      name: 'period',
      postSet: function() {
        this.start();
      }
    },
    'timer'
  ],
  methods: [
    function start() {
      if ( this.timer ) this.clearTimeout(this.timer);
      this.timer = this.setTimeout(function() {
        this.sync();
        this.start();
      }.bind(this), this.period);
    }
  ]
});
