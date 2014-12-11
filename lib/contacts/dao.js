/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  package: 'lib.contacts',
  name: 'ContactNetworkDAO',
  extendsModel: 'AbstractDAO',

  imports: [
    'ajsonp',
    'authAgent'
  ],

  requires: [
    'Contact'
  ],

  properties: [
    {
      name: 'url',
      defaultValue: 'https://www.google.com/m8/feeds/contacts/default/full'
    },
    {
      name: 'authAgent'
    }
  ],

  methods: {
    select: function(sink, options) {
      options = {
        __proto__: options
      };

      var params = [
        'alt=json',
        'v=3.0',
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

      // TODO: Read all results via repeated requests.
      aseq(
        function(ret) {
          self.ajsonp(url, params)(ret);
        },
        function(ret, data) {
          var contacts = data && data.feed && data.feed.entry;
          if ( ! contacts ) {
            sink && sink.error && sink.error('Error loading contacts')
            future.set(sink);
            return;
          }

          for ( var i = 0 ;
                ( i < contacts.length &&
                  ! fc.stopped ) ;
                i++ ) {
            if ( fc.errorEvt ) { 
              sink.error && sink.error(fc.errorEvt);
              future.set(sink);
              ret();
              return;
            }
            var c = contacts[i];
            var contact = self.Contact.create({
              id:      c.id       ? c.id.$t.split('/').pop() : '',
              title:   c.title    ? c.title.$t : '',
              email:   c.gd$email ? c.gd$email[0].address : '',
              updated: c.updated  ? c.updated.$t : ''
            });
            c.gd$phoneNumber && c.gd$phoneNumber.forEach(function(p) {
              contact.phoneNumbers.push(self.PhoneNumber.create({
                type:   p.rel ? p.rel.replace(/^.*#/,'') : p.label ? p.label : 'main',
                number: p.$t
              }));
            });
            c.gd$postalAddress && c.gd$postalAddress.forEach(function(a) {
              contact.addresses.push(self.Address.create({
                type: a.rel.replace(/^.*#/,''),
                street: a.$t
              }));
            });
            sink.put && sink.put(contact, null, fc);
          }
          sink.eof && sink.eof();
          future.set(sink);
          ret();
        })(function(){});
      return future.get;
    }
  }
});
