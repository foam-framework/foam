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
   "package": "foam.lib.contacts",
   "name": "ContactNetworkDAO",
   "extends": "AbstractDAO",
   "requires": [
      "foam.lib.contacts.Contact as Contact",
      "foam.lib.contacts.PhoneNumber as PhoneNumber",
      "foam.lib.contacts.Address as Address"
   ],
   "imports": [
      "ajsonp",
      "authAgent"
   ],
   "exports": [],
   "properties": [
      {
         model_: "Property",
         "name": "daoListeners_",
         "hidden": true,
         "transient": true,
         "factory": function () { return []; }
      },
      {
         model_: "Property",
         "name": "url",
         "defaultValue": "https://www.google.com/m8/feeds/contacts/default/full"
      },
      {
         model_: "Property",
         "name": "authAgent"
      },
      {
         type: 'Int',
         "name": "batchSize",
         "defaultValue": 1000
      },
      {
         model_: "Property",
         "name": "ajsonp",
         "hidden": true,
         "transient": true
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "select",
         "code": function (sink, options) {
      options = {
        __proto__: options
      };

      var params = [
        'alt=json',
        'v=3.0',
        'max-results=' + this.batchSize,
        'orderby=lastmodified'
      ];

      if ( this.authAgent &&
           this.authAgent.accessToken ) {
        param.push('access_token=' + encodeURIComponent(this.authAgent.accessToken));
      }

      var query = options.query;

      if ( query &&
           GtExpr.isInstance(query) &&
           query.arg1.equals(this.Contact.UPDATED) &&
           ConstantExpr.isInstance(query.arg2) ) {
        params.push('updated-min=' + encodeURIComponent(query.arg2.f().toISOString()));
        query = TRUE;
      }

      options.query = query;
      if ( options.order ) {
        if ( options.order.equals(this.Contact.UPDATED) ) {
          options.order = undefined;
        } else if ( DescExpr.isInstance(options.order) &&
                    options.order.arg1.equals(this.Contact.UPDATE) ) {
          options.order = undefined;
          params.push('sortorder=descending');
        }
      }

      sink = this.decorateSink_(sink || [].sink, options);

      var url = this.url;
      var fc = this.createFlowControl_();
      var self = this;
      var future = afuture();
      var index = 1;
      var total = Infinity;
      var error = false;

      // TODO: Read all results via repeated requests.
      awhile(
        function() { return index <= total && ! fc.stopped && ! fc.errorEvt; },
        aseq(
          function(ret) {
            var myparams = params.slice();
            myparams.push("start-index=" + index);
            self.ajsonp(url, myparams)(ret);
          },
          function(ret, data) {
            var contacts = data && data.feed && data.feed.entry;
            if ( ! contacts ) {
              error = true;
              sink && sink.error && sink.error('Error loading contacts')
              future.set(sink);
              return;
            }

            total = data.feed.openSearch$totalResults.$t;

            for ( var i = 0 ;
                  ( i < contacts.length &&
                    ! fc.stopped ) ;
                  i++ ) {
              if ( fc.errorEvt ) {
                error = true;
                sink.error && sink.error(fc.errorEvt);
                future.set(sink);
                ret();
                return;
              }
              var c = contacts[i];
              var contact = self.objFromJson(c);
              index++;
              sink.put && sink.put(contact, null, fc);
            }
            ret();
          }))(function(){
            if ( ! error ) {
              sink.eof && sink.eof();
              future.set(sink);
            }
          });
      return future.get;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "objFromJson",
         "code": function (c) {
      var self = this;
      var obj = this.Contact.create({
        id:      c.id       ? c.id.$t.split('/').pop() : '',
        title:   c.title    ? c.title.$t : '',
        email:   c.gd$email ? c.gd$email[0].address : '',
        updated: c.updated  ? c.updated.$t : ''
      });
      c.gd$phoneNumber && c.gd$phoneNumber.forEach(function(p) {
        obj.phoneNumbers.push(self.PhoneNumber.create({
          type:   p.rel ? p.rel.replace(/^.*#/,'') : p.label ? p.label : 'main',
          number: p.$t
        }));
      });
      c.gd$postalAddress && c.gd$postalAddress.forEach(function(a) {
        obj.addresses.push(self.Address.create({
          type: a.rel.replace(/^.*#/,''),
          street: a.$t
        }));
      });
      return obj;
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
