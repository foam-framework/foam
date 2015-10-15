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
  name: 'WaitCursorDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'count',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        if ( ! this.window ) return;
        if ( oldValue == 0 ) DOM.setClass(this.window.document.body, 'waiting');
        else if ( newValue == 0 ) DOM.setClass(this.window.document.body, 'waiting', false);
      }
    }
  ],

  methods: {
    select: function(sink, options) {
      var self = this;
      var future = afuture();

      this.count++;
      var f = function() {
        self.delegate.select(sink, options)(function(sink) {
          try {
            future.set(sink);
          } finally {
          // ???: Do we need to call this asynchronously if count == 0?
            self.count--;
          }
        });
      };

      // Need to delay when turning on hourglass to give DOM a chance to update
      if ( this.count > 1 ) { f(); } else { this.window.setTimeout(f, 1); };

      return future.get;
    }
  }
});
