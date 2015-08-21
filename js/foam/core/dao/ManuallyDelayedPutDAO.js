/*
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
  name: 'ManuallyDelayedPutDAO',
  package: 'foam.core.dao',
  extendsModel: 'foam.dao.ProxyDAO',

  requires: [ 'foam.dao.ProxyDAO' ],

  properties: [
    {
      name: 'pending',
      factory: function() { return []; }
    },
    {
      model_: 'FunctionProperty',
      name: 'put_',
      factory: function() { return this.ProxyDAO.getFeature('put').code; }
    }
  ],

  methods: {
    put: function(o, sink) {
      this.pending.push({ o: o, sink: sink });
    },
    join: function() {
      var puts = this.pending;
      for ( var i = 0; i < puts.length; ++i ) {
        this.put_(puts[i].o, puts[i].sink);
      }
      this.pending = [];
    }
  }
});
