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
      model_: 'BooleanProperty',
      name: 'loadOnSelect'
    },
    {
      model_: 'BooleanProperty',
      name: 'loadForListeners'
    },
  ],

  methods: {
    listen: function(sink, options) {
      this.SUPER( this.loadForListeners ? this.offloadSink(sink) : sink, options);
    },
    unlisten: function(sink) {
      /* Stop sending updates to the given sink. */
      var ls = this.daoListeners_;
      for ( var i = 0; i < ls.length ; i++ ) {
        if ( ls[i].__proto__.$UID === sink.$UID ||
             ls[i].$UID === sink.$UID ) { // we may decorate, so check proto too
          ls.splice(i, 1);
          return true;
        }
      }
      if ( DEBUG ) console.warn('Phantom DAO unlisten: ', this, sink);
    },
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
      // TODO: this doesn't address potential put()s going out of order. Chain of futures instead?
      var self = this;
      return {
        __proto__: sink,
        activePuts: 0, // semaphore to ensure the delegate's eof() comes after our async puts
        put: function(obj) {
          var sinkSelf = this;
          sinkSelf.activePuts++;
          self.offloadDAO.find(obj.id, {
            put: function(offload) {
              sinkSelf.decrementPuts();
              if ( offload[self.property.name] )
                obj[self.property.name] = offload[self.property.name];
              sink.put && sink.put(obj);
            },
            error: function(offload) {
              // fail-through
              sinkSelf.decrementPuts();
              sink.put && sink.put(obj);
            }
          });
        },
        eof: function() {
          if ( this.activePuts <= 0 ) sink.eof();
        },
        decrementPuts: function() {
          --this.activePuts;
          if (this.activePuts <= 0) {
            sink.eof();
            console.assert(this.activePuts === 0, "PropertyOffloadDAO had a bad activePut count", this.activePuts);
          }
        }
      };
    },

    find: function(id, sink) {
      this.delegate.find(id, this.offloadSink(sink));
    }
  }
});
