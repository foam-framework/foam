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
  name: 'StoreAndForwardDAO',
  package: 'foam.core.dao',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.dao.IDBDAO',
    'foam.dao.SeqNoDAO'
  ],

  models: [
    {
      name: 'StoreAndForwardOperation',
      properties: [
        { type: 'Int', name: 'id' },
        { type: 'String', name: 'method', view: { factory_: 'foam.ui.ChoiceView', choices: ['put', 'remove'] } },
        { name: 'obj' }
      ]
    }
  ],

  properties: [
    { name: 'storageName' },
    { name: 'store', required: true, type: 'DAO',
      factory: function() {
        // TODO(markdittmer): There should be an easier way to ensure that the
        // IDBDAO can correctly deserialize inner models.
        var Y = this.Y.sub();
        Y.registerModel(this.StoreAndForwardOperation);
        return this.SeqNoDAO.create({
          delegate: this.IDBDAO.create({
            model: this.StoreAndForwardOperation,
            name: this.storageName || ( this.delegate.model ? this.delegate.model.plural + '-operations' : '' ),
            useSimpleSerialization: false
          }, Y)
        });
      }
    },
    { type: 'Int', name: 'retryInterval', units: 'ms', defaultValue: 5000 },
    { type: 'Boolean', name: 'syncing', defaultValue: false }
  ],

  methods: {
    store_: function(method, obj, sink) {
      var self = this;
      var op = this.StoreAndForwardOperation.create({
        method: method,
        obj: obj.clone()
      });
      self.store.put(op, {
        put: function(o) {
          sink && sink[method] && sink[method](obj);
          self.pump_();
        },
        error: function() {
          sink && sink.error && sink.error(method, obj);
        }
      });
    },
    put: function(obj, sink) {
      this.store_('put', obj, sink);
    },
    remove: function(obj, sink) {
      this.store_('remove', obj, sink);
    },
    pump_: function() {
      if ( this.syncing ) return;
      this.syncing = true;

      var self = this;
      awhile(
        function() { return self.syncing; },
        aseq(
          function(ret) {
            self.forward_(ret);
          },
          function(ret) {
            self.store.select(COUNT())(function(c) {
              if ( c.count === 0 ) self.syncing = false;
              ret();
            });
          },
          function(ret) {
            self.X.setTimeout(ret, self.retryInterval);
          }
        ))(function(){});
    },
    forward_: function(ret) {
      var self = this;
      this.store.orderBy(this.StoreAndForwardOperation.ID).select()(function(ops) {
        var funcs = [];
        for ( var i = 0; i < ops.length; i++ ) {
          (function(op) {
            funcs.push(function(ret) {
              self.delegate[op.method](op.obj, {
                put: function(obj) {
                  // If the objects id was updated on put, remove the old one and put the new one.
                  if ( obj.id !== op.obj.id ) {
                    self.notify_('remove', [op.obj]);
                    self.notify_('put', [obj]);
                  }
                  ret(op);
                },
                remove: function() {
                  ret(op);
                },
                error: function() {
                  ret();
                }
              });
            });
          })(ops[i]);
        }

        aseq(
          apar.apply(null, funcs),
          function(ret) {
            var funcs = [];
            for ( var i = 1; i < arguments.length; i++ ) {
              (function(op) {
                funcs.push(function(ret) {
                  self.store.remove(op, ret);
                });
              })(arguments[i]);
            }
            apar.apply(null, funcs)(ret);
          })(ret);
      });
    }
  }
});
