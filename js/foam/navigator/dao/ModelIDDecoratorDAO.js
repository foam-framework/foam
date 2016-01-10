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
  name: 'ModelIDDecoratorDAO',
  package: 'foam.navigator.dao',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.navigator.dao.IDConfig'
  ],

  todo: multiline(function() {/*
    (markdittmer): Implement ID rewriting support for removeAll(), select(),
                   where(), orderBy().
  */}),

  properties: [
    {
      name: 'model'
    },
    {
      name: 'config',
      type: 'foam.navigator.dao.IDConfig',
      required: true,
      factory: function() { return this.IDConfig.create(); }
    },
    {
      name: 'put_',
      type: 'Function',
      defaultValue: function(sink, obj) {
        var decoratedObj = obj.clone();
        decoratedObj.id = this.config.decorateID(obj.model_, obj.id);
        sink && sink.put && sink.put(decoratedObj);
      }
    },
    {
      name: 'error_',
      defaultValue: function(sink) {
        var args = argsArray(arguments).slice(1);
        sink.error.apply(sink, args);
      }
    },
    {
      name: 'remove_',
      defaultValue: function(model, sink, id) {
        sink.remove(this.config.decorateID(model, id));
      }
    },
  ],

  methods: [
    {
      name: 'relay_',
      code: function(sink, id) {
        if ( ! this.relay__ ) {
          this.relay__ = this.newRelay(sink, id);
        }

        return this.relay__;
      }
    },
    {
      name: 'newRelay',
      code: function(sink, id) {
        var objID = id;
        if ( objID && objID.id ) objID = objID.id;
        var model = { name: objID && this.config.getModelName(objID) };
        return {
          put: function(o) {
            sink && sink.put && this.put_.bind(this, sink)(o);
          }.bind(this),
          error: sink && sink.error && this.error_.bind(this, sink),
          remove: model && sink && sink.remove &&
              this.remove_.bind(this, model, sink)
        };
      }
    },
    {
      name: 'put',
      code: function(obj, opt_sink) {
        var delegateObj = obj.clone();
        if ( delegateObj.id ) delegateObj.id = this.config.dedecorateID(obj.id);
        this.delegate.put(delegateObj, this.newRelay(opt_sink));
      }
    },
    {
      name: 'remove',
      code: function(id, opt_sink) {
        this.delegate.remove(
            this.config.dedecorateID(id),
            this.newRelay(opt_sink, id));
      }
    },
    {
      name: 'find',
      code: function(id, sink) {
        this.delegate.find(
            this.config.dedecorateID(id),
            this.newRelay(sink, id));
      }
    },
    {
      name: 'listen',
      code: function(sink, options) {
        if ( ! this.daoListeners_.length && this.delegate ) {
          this.delegate.listen(this.relay_(sink));
        }
        this.SUPER(sink, options);
      }
    },
    {
      name: 'unlisten',
      code: function(sink) {
        this.SUPER(sink);
        if ( ! this.daoListeners_.length && this.delegate ) {
          this.delegate.unlisten(this.relay_());
        }
      }
    },
    {
      name: 'select',
      code: function(sink, options) {
        // TODO(braden): Handle queries for ID here.
        return this.delegate.select({
          put: this.put_.bind(this, sink),
          eof: sink && sink.eof && sink.eof.bind(sink)
        }, options);
      }
    },
    {
      name: 'removeAll',
      code: function(sink, options) {
        // TODO(braden): Handle queries for ID here. Since in removeAll it's
        // dangerous to ignore a query, removeAll is disabled.
        console.error('ModelIDDecoratorDAO does not implement removeAll');
      }
    }
  ]
});
