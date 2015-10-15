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
  name: 'OrDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Looks up things in primary, then in delegate. Supports find() only!',

  properties: [
    {
      name: 'primary',
      documentation: 'This is the DAO to look things up in first.'
    }
  ],

  methods: {
    find: function(id, sink) {
      id = id.id || id;
      this.primary.find(id, {
        put: sink.put.bind(sink),
        error: function() { this.delegate.find(id, sink); }.bind(this)
      });
    }
  }
});
