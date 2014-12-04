/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'SplitDAO',

  requires: [
    'MDAO'
  ],

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      hidden: true,
      required: true
    },
    {
      name: 'remote',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true
    },
    {
      model_: 'FunctionProperty',
      name: 'placeholderFactory'
    },
    {
      model_: 'IntProperty',
      name: 'staleTimeout',
      defaultValue: 5000
    },
    {
      name: 'delegate',
      factory: function() {
        // TODO: Cleanup the index setup, it shouldn't be this hard.
        var dao = this.MDAO.create({
          model: this.model,
        });
        dao.index = AltIndex.create(
          AutoPositionIndex.create(
            this.placeholderFactory,
            dao,
            this.remote,
            this.staleTimeout),
          TreeIndex.create(this.model.getProperty(this.model.ids[0])));
        dao.root = [[]];
        return dao;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.remote.listen({
        put: function(obj) {
          debugger;
          self.delegate.put(obj);
        },
        remove: function(obj) {
          debugger;
          self.delegate.remove(obj);
        }
      });
    },

    put: function(obj, sink) {
      this.remote.put(obj, sink);
    },

    remove: function(obj, sink) {
      this.remote.remove(obj, sink);
    },

    find: function(key, sink) {
      var remote = this.remote;
      var delegate = this.delegate
      this.SUPER(key, {
        put: function(obj) {
        },
        error: function() {
          remote.find(key, {
            put: function(obj) {
              sink && sink.put && sink.put(obj);
              delegate.put(obj);
            },
            error: (sink && sink.error) ? sink.error.bind(sink) : undefined
          })
        }
      });
    }
  }
});
