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
  package: 'com.google.mail',
  name: 'IdMapperDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.lib.email.EMail'
  ],
  methods: [
    function put(obj, sink) {
      if ( ! obj.id ) {
        this.delegate.where(EQ(this.EMail.GMAIL_ID, obj.gmailId)).select()(function(a) {
          if ( a.length ) {
            obj.id = a[0].id;
          }
          this.delegate.put(obj, sink);
        }.bind(this));
        return;
      }
      this.SUPER(obj, sink);
    },
    function remove(obj, sink) {
      if ( ! obj.model_ ) {
        this.SUPER(obj.sink);
        return;
      }

      if ( ! obj.id ) {
        this.delegate.where(EQ(this.EMail.GMAIL_ID, obj.gmailId)).select()(function(a) {
          if ( ! a.length ) {
            sink && sink.error && sink.error('Could not find matching email.');
            return;
          }

          obj.id = a[0].id;
          this.delegate.remove(obj, sink);
        }.bind(this));
        return;
      }
      this.SUPER(obj, sink);
    }
  ]
});
