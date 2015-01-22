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
  name: 'FOAMletDecoratorDAO',
  package: 'foam.navigator.dao',
  extendsModel: 'ProxyDAO',

  requires: [
    'foam.navigator.WrappedFOAMlet'
  ],


  properties: [
    {
      name: 'FOAMletModel',
      model_: 'ModelProperty'
    },
    {
      name: 'put_',
      model_: 'FunctionProperty',
      defaultValue: function(sink, obj) {
        var decoratedObj = this.FOAMletModel.create({ data: obj });
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
        sink.remove(id);
      }
    },
    {
      name: 'relay_'
    }
  ],

  methods: [
    {
      name: 'relay',
      code: function(sink, id) {
        if ( ! this.relay_ ) {
          this.relay_ = this.newRelay(sink, id);
        }

        return this.relay_;
      }
    },
    {
      name: 'newRelay',
      code: function(sink, id) {
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
        this.delegate.put(obj.data, this.newRelay(opt_sink));
      }
    },
    {
      name: 'remove',
      code: function(id, opt_sink) {
        this.delegate.remove(id, this.newRelay(opt_sink, id));
      }
    },
    {
      name: 'find',
      code: function(id, sink) {
        this.delegate.find(id, this.newRelay(sink, id));
      }
    },
    {
      name: 'listen',
      code: function(sink, options) {
        if ( ! this.daoListeners_.length && this.delegate ) {
          this.delegate.listen(this.relay(sink));
        }
        this.SUPER(sink, options);
      }
    },
    {
      name: 'unlisten',
      code: function(sink) {
        this.SUPER(sink);
        if ( ! this.daoListeners_.length && this.delegate ) {
          this.delegate.unlisten(this.relay());
        }
      }
    },
    {
      name: 'select',
      code: function(sink, options) {
        return this.delegate.select(this.newRelay(sink), options);
      }
    }
  ]
});
