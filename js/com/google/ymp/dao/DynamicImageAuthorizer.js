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
  package: 'com.google.ymp.dao',
  name: 'DynamicImageAuthorizer',
  implements: ['foam.dao.Authorizer'],

  requires: [
    'com.google.ymp.DynamicImage',
    'com.google.ymp.Person',
  ],

  imports: [
    'personDAO_ as personDAO',
    'console',
  ],

  documentation: function() {/*
    <p>$$DOC{ref:'foam.dao.Authorizer'} that looks up the principal Person,
    checks for default image quality, and only allows images of that quality or
    below to be synced. This prevents an entire market-load of high quality,
    large images from being synched onto a client device.</p>
  */},

  methods: [
    function withDefaultQuality(ret, X) {
      // lookup principal Person
      var self = this;
      this.personDAO.find(X.principal, {
        put: function(p) {
          ret(p.defaultImageLOD, p.subscribedMarkets);
        },
        error: function(err) {
          self.console.warn('DynamicImageAuthorizer user find error: ' + err, X.principal);
          ret(0);
        }
      });      
    },
    
    
    function massageForPut(ret, X, old, nu) {
      ret(nu);
    },
    function massageForRead(ret, X, obj) {
      if ( ! X.principal ) {
        ret(null);
        return;
      }
      var self = this;
      this.withDefaultQuality(function(quality, markets) {
        if ( obj.levelOfDetail <= quality && IN(self.DynamicImage.MARKET, markets).f(obj) ) {
          ret(obj);
        } else {
          ret(null);
        }
      }, X);
      
    },
    function shouldAllowRemove(ret, X, obj) {
      if ( ! X.principal ) {
        ret(null);
        return;
      }

      ret(false); // images can't be removed by the client. Server cleans them up?
    },
    function decorateForSelect(ret, X, dao) {
      if ( ! X.principal ) {
        ret(dao.where(FALSE));
        return;
      }
      var self = this;
      this.withDefaultQuality(function(quality, markets) {
        ret(dao.where(AND(
          LTE(self.DynamicImage.LEVEL_OF_DETAIL, quality),
          IN(self.DynamicImage.MARKET, markets)
        )));
      }, X);
    },
  ]
});
