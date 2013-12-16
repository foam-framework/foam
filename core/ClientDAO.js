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

var ClientDAO = FOAM({
  model_: 'Model',
  name: 'ClientDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'asend',
      help: 'afunc used to send request to the DAOServer.',
      required: true
    },
    {
      name: 'model',
      required: true
    },
    {
      name: 'subject',
      valueFactory: function() { return this.model.name + 'DAO'; }
    },
  ],

  methods: {
    oneShot_: function(method, params, sink) {
      var self = this;
      this.asend(function(resp) {
        if ( !sink ) return;
        if ( resp.put ) sink.put(resp.put);
        else if ( resp.remove ) sink.remove(resp.remove);
        else if ( resp.error ) sink.error(resp.error);
      }, {
        subject: self.subject,
        method: method,
        params: params
      });
    },
    put: function(obj, sink) {
      this.oneShot_('put', [obj], sink);
    },
    remove: function(obj, sink) {
      this.oneShot_('remove', [obj], sink);
    },
    find: function(q, sink) {
      this.oneShot_('find', [q], sink);
    },
    select: function(sink, options) {
      sink = sink || [];
      var future = afuture();

      var self = this;

      if ( sink.model_ && sink.reduceI) {
        this.asend(function(response) {
          sink.reduceI(response);
          future.set(response);
        }, {
          subject: self.subject,
          method: 'select',
          params: [sink, options]
        });
      } else if ( Array.isArray(sink) ) {
        this.asend(function(response) {
          future.set(response);
        }, {
          subject: self.subject,
          method: 'select',
          params: [sink, options]
        });
      } else {
        var fc = this.createFlowControl_();

        this.asend(function(response) {
          for ( var i = 0; i < response.length; i++ ) {
            if ( fc.stopped ) break;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              break;
            }
            sink.put && sink.put(response[i], null, fc);
          }
          sink.eof && sink.eof();
          future.set(sink);
        }, {
          subject: self.subject,
          method: 'select',
          params: [[], options]
        });
      }

      return future.get;
    }
  }
});
