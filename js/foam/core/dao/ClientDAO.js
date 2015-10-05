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
  model_: "Model",
  package: "foam.core.dao",
  name: "ClientDAO",
  extendsModel: "AbstractDAO",
  properties: [
    {
      name: "asend",
      required: true,
      help: "afunc used to send request to the DAOServer."
    },
    {
      name: "model",
      required: true
    },
    {
      name: "subject",
      factory: function () { return this.model.id + 'DAO'; }
    }
  ],
  methods: [
    {
      name: "oneShot_",
      code: function (method, params, sink) {
        var self = this;
        this.asend(function(resp) {
          if ( !sink ) return;
          if ( ! resp ) sink && sink.error && sink.error(method, params[0]);
          if ( resp.put ) {
            if ( resp.put.model_ )
              self.notify_('put', [resp.put]);
            else
              self.notify_('put', [params[0]]);
            sink && sink.put && sink.put(resp.put);
          } else if ( resp.remove ) {
            self.notify_('remove', [params[0]]);
            sink && sink.remove && sink.remove(resp.remove);
          } else if ( resp.error ) sink.error(resp.error);
        }, {
          subject: self.subject,
          method: method,
          params: params
        });
      }
    },
    {
      name: "put",
      code: function (obj, sink) {
        this.oneShot_('put', [obj], sink);
      }
    },
    {
      name: "remove",
      code: function (obj, sink) {
        this.oneShot_('remove', [obj], sink);
      }
    },
    {
      name: "find",
      code: function (q, sink) {
        this.oneShot_('find', [q], sink);
      }
    },
    {
      name: "removeAll",
      code: function (sink, options) {
        // If sink.remove is not defined, we can skip the expensive returning of data.
        // If we need results back, the server returns an array of removed values.
        var hasSink = !!(sink && sink.remove);
        var future = afuture();
        this.asend(function(response) {
          if (hasSink && response) {
            if (sink.remove) response.forEach(sink.remove);
          }
          sink && sink.eof && sink.eof();
          future.set();
        }, {
          subject: self.subject,
          method: 'removeAll',
          params: [hasSink, options]
        });
        return future;
      }
    },
    {
      name: "select",
      code: function (sink, options) {
        var future = afuture();

        var self = this;

        // XXX: This used to be sink.model_ || Array.isArray, but that would eg.
        // send an instance of MDAO, rather than its data.
        if ( Expr.isInstance(sink) || Array.isArray(sink) || ! sink ) {
          this.asend(function(response) {
            if ( ! response ) sink && sink.error && sink.error();
            future.set(response || sink);
          }, {
            subject: self.subject,
            method: 'select',
            params: [sink || null, options]
          });
        } else {
          var fc = this.createFlowControl_();

          this.asend(function(response) {
            if ( ! response ) {
              sink && sink.error && sink.error('');
              future.set(sink);
              return;
            }
            if ( ! Array.isArray(response) ) {
              sink.error && sink.error("Received response that wasn't an array.");
              return;
            }
            for ( var i = 0; i < response.length; i++ ) {
              if ( fc.stopped ) break;
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                break;
              }
              if ( ! response[i].model_ ) {
                sink.error && sink.error("Received response that wasn't an object.");
                break;
              }
              sink.put && sink.put(response[i], null, fc);
            }
            sink.eof && sink.eof();
            future.set(sink);
          }, {
            subject: self.subject,
            method: 'select',
            params: [null, options]
          });
        }

        return future.get;
      }
    }
  ]
});
