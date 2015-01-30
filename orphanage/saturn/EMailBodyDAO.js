/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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


var EMailBodyDAO = FOAM({
   model_: 'Model',
   extendsModel: 'ProxyDAO',

   name: 'EMailBodyDAO',

   properties: [
      {
         name: 'bodyDAO',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true,
         transient: true
      }
   ],

   methods: {
      LOADING_MSG: '',

      put: function(obj, sink) {
         var body = EMail.create({id: obj.id, body: obj.body});
         obj.body = '';
         this.delegate.put(obj, sink);

         // If we haven't loaded the body of Email yet,
         // then don't save the fake body into the bodyDAO.
         if ( body.body != this.LOADING_MSG ) this.bodyDAO.put(body);
      },
      find: function(key, sink) {
         var self = this;

         this.delegate.find(key, {
            __proto__: sink,
            put: function(email) {
               if ( email.body ) {
                  sink.put && sink.put(email);
                  return;
               }
               // TODO: set a timeout to set the message to "Loading..." after some small delay, say 200ms.
               email.body = self.LOADING_MSG;
               sink.put && sink.put(email);
               self.bodyDAO.find(key, { put: function(body) {
                  email.body = body.body;
               }});
            }
         });
      }
   }
});
