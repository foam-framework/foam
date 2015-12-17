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
  name: 'MarketSubAuthorizer',
  implements: ['foam.dao.Authorizer'],

  requires: [
    'com.google.ymp.Market',
    'com.google.ymp.Person',
    'com.google.ymp.bb.Post',
  ],

  imports: [
    'personDAO_ as personDAO',
    'console',
  ],

  documentation: function() {/*
    <p>$$DOC{ref:'foam.dao.Authorizer'} that looks up the principal Person,
    checks for subscription to the given MarketID/p>
  */},

  properties: [
    {
      type: 'Array',
      subType: 'Property',
      name: 'marketProps',
      lazyFactory: function() {
        return [this.Post.MARKET];
      },
    },
    {
      name: 'junctionMLang',
      documentation: 'The MLang operation for joining market property checks',
      lazyFactory: function() {
        return AND;
      },
    },
  ],

  methods: [
    function massageForPut(ret, X, old, nu) {
      ret(nu);
    },
    function massageForRead(ret, X, obj) {
      if ( ! X.principal ) {
        ret(null);
        return;
      }

      // lookup principal Person
      var self = this;
      self.personDAO.find(X.principal, {
        put: function(p) {
          // Construct query:
          // Join together from i = 0 to n - 1:
          //   Elem of person's subscribedMarkets = obj's marketProps[i] value.
          // Join for AND starts with TRUE.
          // Join for OR, IN, etc. starts with FALSE.
          var expr = self.junctionMLang === AND ? TRUE : FALSE;
          for ( var i = 0; i < self.marketProps.length; ++i ) {
            expr = self.junctionMLang(
                EQ(
                    self.Person.SUBSCRIBED_MARKETS,
                    self.marketProps[i].f(obj)),
                expr);
          }
          if ( expr.f(p) ) {
            ret(obj); // the principal is subscribed to the market this object belongs to
          } else {
            ret(null); // not subscribed, don't sync this object
          }
        },
        error: function(err) {
          self.console.warn('MarketSubAuthorizer user find error: ' + err, X.principal);
          ret(null);
        }
      });
    },
    function shouldAllowRemove(ret, X, obj) {
      if ( ! X.principal ) {
        ret(null);
        return;
      }

      ret(true);
    },
    function decorateForSelect(ret, X, dao) {
      if ( ! X.principal ) {
        ret(dao.where(FALSE));
        return;
      }
      var self = this;
      this.personDAO.find(X.principal, {
        put: function(p) {
          // filter by user's subscribed markets
          // HACK: Post.MARKET used to represent any model with a 'market' reference property
          ret(dao.where(IN(self.Post.MARKET, p.subscribedMarkets)));
        },
        error: function(err) {
          self.console.warn('MarketSubAuthorizer user select error: ' + err, X.principal);
          ret(dao.where(FALSE));
        }
      });
    },
  ]
});
