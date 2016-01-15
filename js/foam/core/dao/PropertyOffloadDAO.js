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
  name: 'PropertyOffloadDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'property'
    },
    {
      name: 'offloadDAO'
    },
    {
      type: 'Boolean',
      name: 'loadOnSelect'
    }
  ],

  methods: {
    put: function(obj, sink) {
      if ( obj.hasOwnProperty(this.property.name) ) {
        var offload = this.model.create({ id: obj.id });
        offload[this.property.name] = this.property.f(obj);
        obj.clearProperty(this.property.name);
        this.offloadDAO.put(offload);
      }
      this.delegate.put(obj, sink);
    },

    select: function(sink, options) {
      if ( ! this.loadOnSelect ) return this.delegate.select(sink, options);

      var mysink = this.offloadSink(sink);
      return this.delegate.select(mysink, options);
    },

    offloadSink: function(sink) {
      var self = this;
      return {
        __proto__: sink,
        put: function(obj) {
          sink.put && sink.put.apply(sink, arguments);
          self.offloadDAO.find(obj.id, {
            put: function(offload) {
              if ( offload[self.property.name] )
                obj[self.property.name] = offload[self.property.name];
            }
          });
        },
      };
    },

    find: function(id, sink) {
      this.delegate.find(id, this.offloadSink(sink));
    }
  }
});
