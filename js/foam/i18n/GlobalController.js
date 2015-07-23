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
  package: 'foam.i18n',
  name: 'GlobalController',

  requires: [
    'foam.i18n.IdGenerator',
    'foam.i18n.MessagesExtractor',
    'foam.i18n.MessagesInjector',
    'foam.i18n.ChromeMessagesInjector'
  ],

  properties: [
    {
      name: 'idGenerator',
      factory: function() {
        return this.IdGenerator.create();
      }
    },
    {
      name: 'extractor',
      lazyFactory: function() {
        return this.MessagesExtractor.create({
          idGenerator$: this.idGenerator$
        });
      }
    },
    {
      name: 'injector',
      lazyFactory: function() {
        if ( GLOBAL.chrome && GLOBAL.chrome.runtime &&
            GLOBAL.chrome.runtime.id ) {
          return this.ChromeMessagesInjector.create({
            idGenerator$: this.idGenerator$
          });
        } else {
          return this.MessagesInjector.create({
            idGenerator$: this.idGenerator$
          });
        }
      }
    }
  ],

  methods: [
    {
      name: 'avisitAllCurrentModels',
      code: function(ret, visitors) {
        var par = [], modelNames = Object.keys(USED_MODELS);
        for ( var i = 0; i < modelNames.length; ++i ) {
          par.push(this.avisitModel(visitors, lookup(modelNames[i])));
        }
        return apar.apply(null, par);
      }
    },
    {
      name: 'avisitAllKnownModels',
      code: function(visitors) {
        var par = [];
        var modelNames, i;

        modelNames = Object.keys(USED_MODELS);
        for ( i = 0; i < modelNames.length; ++i ) {
          par.push(this.avisitModel(visitors, lookup(modelNames[i])));
        }
        modelNames = Object.keys(UNUSED_MODELS);
        for ( i = 0; i < modelNames.length; ++i ) {
          par.push(this.avisitModel(visitors, lookup(modelNames[i])));
        }

        return apar.apply(null, par);
      }
    },
    {
      name: 'avisitModel',
      code: function(visitors, model) {
        var par = [];
        for ( var i = 0; i < visitors.length; ++i ) {
          par.push(visitors[i].avisitModel(model));
        }
        return apar.apply(null, par);
      }
    }
  ]
});

X.arequire('foam.i18n.GlobalController')(function(GlobalController) {
  var i18nGC = GlobalController.create();
  GLOBAL.X.i18nModel = function(ret, model, X) {
    i18nGC.avisitModel([
      // i18nGC.extractor,
      i18nGC.injector
    ], model)(ret);
  };
});
