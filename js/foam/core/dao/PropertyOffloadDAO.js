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
      // TODO: For pipe(), this offloadSink should coordinate with the select()'s offloadSink,
      // so that the select puts, then eof, then the listen puts come through in order.
      // Otherwise listener puts aren't in a guaranteed order.
      this.SUPER( this.loadForListeners ? this.simpleOffloadSink(sink) : sink, options);
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

    simpleOffloadSink: function(sink) {
      var self = this;
      return {
        __proto__: sink,
        put: function(obj) {
          self.offloadDAO.find(obj.id, {
            put: function(offload) {
              if ( offload[self.property.name] )
                obj[self.property.name] = offload[self.property.name];
              sink.put && sink.put(obj);
            },
            error: function(offload) {
              // fail-through
              sink.put && sink.put(obj);
            }
          });
        },
        eof: function() {
          sink.eof && sink.eof();
        },
      };
    },

    offloadSink: function(sink) {
      var self = this;
      return {
        __proto__: sink,
        previousFuture: afuture().set(),
        put: function(obj) {
          /* Each put sets up a new future in the chain. The offloaded-data find
            starts immediately, and when it completes the previous future is
            asked to call our completion, which will then trigger our future to set
            the future for the next put (or eof) in the chain.
          */
          var sinkSelf = this;
          var previousFuture = sinkSelf.previousFuture;
          var myFuture = sinkSelf.previousFuture = afuture();

          var completePutFn = function(ret) {
            sink.put && sink.put(obj);
            myFuture.set();
          };

          self.offloadDAO.find(obj.id, {
            put: function(offload) {
              if ( offload[self.property.name] )
                obj[self.property.name] = offload[self.property.name];
              previousFuture.get(completePutFn);
            },
            error: function(offload) {
              // fail-through
              previousFuture.get(competePutFn);
            }
          });
        },
        eof: function() {
          var previousFuture = this.previousFuture;
          var myFuture = this.previousFuture = afuture();
          previousFuture.get(function() {
            sink.eof && sink.eof();
            myFuture.set();
            // TODO: listenerFuture.set() to allow dao listeners to procede?
          });
        },
      };
    },

    find: function(id, sink) {
      this.delegate.find(id, this.simpleOffloadSink(sink));
    }
  }
});
