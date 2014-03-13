/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

FOAModel({
  model_: 'Model',
  extendsModel: 'AbstractDAO',

  name: 'ChromeStorageDAO',
  label: 'Chrome Storage DAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      required: true
    },
    {
      name:  'store',
      defaultValueFn: function() { return chrome.storage.local; }
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      this.serialize = this.SimpleSerialize;
      this.deserialize = this.SimpleDeserialize;
    },

    FOAMDeserialize: function(json) {
      return JSONToObject.visitObject(json);
    },

    FOAMSerialize: function(obj) {
      return ObjectToJSON.visitObject(obj);
    },

    SimpleDeserialize: function(json) {
      return this.model.create(json);
    },

    SimpleSerialize: function(obj) {
      return obj.instance_;
    },

    put: function(value, sink) {
      var self = this;

      if ( this.batch_ ) {
        this.batch_.push(value);
        this.sinks_.push(sink);
      } else {
        this.batch_ = [];
        this.sinks_ = [];
        var obj = {};
        obj[value.id] = value;
        this.store.set(obj, function() {
          var batch = self.batch_;
          var sinks = self.sinks_;
          self.batch_ = undefined;
          self.sinks_ = undefined;
          // TODO: check runtime.lastError and call sink.error instead of set
          sink && sink.put && sink.put(value);
          if ( batch.length ) {
            var obj = {};
            for ( var i = 0 ; i < batch.length ; i++ )
              obj[batch[i].id] = batch[i];
            self.store.set(obj, function() {
              for ( var i = 0 ; i < sinks.length ; i++ )
                sinks[i] && sinks[i].put && sinks[i].put(batch[i]);
            })
          }
        });
      }
    },

    /* Simple put without batching.
    put: function(value, sink) {
      var self = this;
      this.store.set({id: value}, function() {
        // TODO: check runtime.lastError and call sink.error instead of set
        sink && sink.put && sink.put(value);
      });
    },
    */

    find: function(key, sink) {
      this.store.get({id: key}, function(obj) {
        sink.put(obj);
      });
    },

    remove: function(obj, sink) {
      this.store.remove(obj, sink);
    },

    select: function(sink, options) {
      var future = afuture();
      this.store.get(null, function() {
        console.log('select ', arguments);
      });
      return future.get;
    }
  }
});

IDBDAO = ChromeStorageDAO;
