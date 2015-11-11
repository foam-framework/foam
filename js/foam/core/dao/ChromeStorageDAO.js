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

CLASS({
  name: 'ChromeStorageDAO',
  package: 'foam.core.dao',
  label: 'Chrome Storage DAO',

  extends: 'AbstractDAO',

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
        return this.model.id;
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

      var self = this;

//      this.daoListeners_ = []; // This is required to work around some bug.
      chrome.storage.onChanged.addListener(function(changes, namespace) {
        for ( key in changes ) {
          if ( chrome.storage[namespace] === self.store && self.isID_(key) ) {
            if ( changes[key].newValue ) {
              self.notify_('put', [self.deserialize(changes[key].newValue)]);
            } else {
              self.notify_('remove', [self.deserialize(changes[key].oldValue)]);
            }
          }
        }
      });

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

    isID_: function(id) {
      return id.startsWith(this.prefix_ || ( this.prefix_ = this.name + '-' ) );
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

    find: function(key, sink) { this.select()(function(a) { a.find(key, sink); }); },

    remove: function(obj, sink) {
      this.store.remove(this.toID_(obj), function() {
        sink && sink.remove && sink.remove(obj);
      });
    },

    select: function(sink, options) {
      var self = this;
      sink = sink || [];
      var future = afuture();
      this.store.get(null, function(map) {
        for ( key in map ) {
          if ( self.isID_(key) ) {
            sink && sink.put && sink.put(self.deserialize(map[key]));
          }
        }
        future.set(sink);
      });
      return future.get;
    }
  }
});
