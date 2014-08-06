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

MODEL({
  name: 'ChromeStorageDAO',
  label: 'Chrome Storage DAO',

  extendsModel: 'AbstractDAO',

  properties: [
    {
      name:  'model',
      type:  'Model',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      name:  'store',
      defaultValueFn: function() { return chrome.storage.local; }
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      this.serialize   = this.SimpleSerialize;
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
      var s = {};
      for ( var key in obj.instance_ ) {
        var prop = obj.model_.getProperty(key);
        if ( ! prop.transient ) s[key] = obj.instance_[key];
      }
      return s;
    },

    /*
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
    */

    toID_: function(obj) {
      return this.name + '-' + obj.id;
    },

    // Simple put without batching.
    put: function(value, sink) {
      var map = {};
      map[this.toID_(value)] = this.serialize(value);
      this.store.set(map, function() {
        // TODO: check runtime.lastError and call sink.error instead of set
        sink && sink.put && sink.put(value);
      });
    },

    find: function(key, sink) {
      throw "Unsupported Operation: ChromeStorage.find(). Add CachingDAO.";
      /*
      this.store.get({id: key}, function(obj) {
        sink.put(obj);
      });
      */
    },

    remove: function(obj, sink) {
      this.store.remove(this.toID_(obj), function() {
        debugger;
      });
    },

    select: function(sink, options) {
      sink = sink || [];
      var future = afuture();
      var prefix = this.name + '-';
      this.store.get(null, function(map) {
        for ( key in map ) {
          if ( key.startsWith(prefix ) ) {
            sink && sink.put && sink.put(map[key]);
          }
        }
        future.set(sink);
      });
      return future.get;
    }
  }
});


MODEL({
  name: 'ChromeSyncStorageDAO',
  label: 'Chrome Sync Storage DAO',

  extendsModel: 'ChromeStorageDAO',

  properties: [
    {
      name:  'store',
      defaultValueFn: function() { return chrome.storage.sync; }
    }
  ]
});
