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
    'foam.i18n.MessagesExtractor',
    'foam.i18n.MessagesInjector',
    'foam.i18n.ChromeMessagesInjector',
  ],

  properties: [
    {
      name: 'extractor',
      lazyFactory: function() {
        return this.MessagesExtractor.create();
      }
    },
    {
      name: 'injector',
      lazyFactory: function() {
        debugger;
        if ( GLOBAL.chrome && GLOBAL.chrome.runtime &&
            GLOBAL.chrome.runtime.id ) {
          return this.ChromeMessagesInjector.create();
        } else {
          return this.MessagesInjector.create();
        }
      }
    }
  ],

  methods: [
    {
      name: 'visitAllCurrentModels',
      code: function(visitors) {
        var self = this;
        Object_forEach(USED_MODELS, function(_, modelName) {
          console.log('Visiting', modelName);
          self.visitModel(visitors, lookup(modelName));
        });
      }
    },
    {
      name: 'visitAllKnownModels',
      code: function(visitors) {
        var self = this;
        ['USED_MODELS', 'UNUSED_MODELS'].forEach(function(collName) {
          Object_forEach(GLOBAL[collName], function(_, modelName) {
            self.visitModel(visitors, lookup(modelName));
          });
        });
      }
    },
    {
      name: 'visitModel',
      code: function(visitors, model) {
        if ( model.i18nComplete_ ) return;
        visitors.forEach(function(visitor) {
          visitor.visitModel(model);
        });
        model.i18nComplete_ = true;
      }
    }
  ]
});

arequire('foam.i18n.GlobalController')(function(GlobalController) {
  console.log('Constructing GlobalController');
  var i18nGC = GlobalController.create();
  // TODO(markdittmer): We need a more reasonable way to trigger extraction.
  window.setTimeout(function() {
    i18nGC.visitAllKnownModels([
      // i18nGC.extractor,
      i18nGC.injector
    ]);
  }, 0);
  GLOBAL.X.i18nModel = function(model, X, ret) {
    console.log('Visting model', model.name);
    i18nGC.visitModel([
      // i18nGC.extractor,
      i18nGC.injector
    ], model);
    ret && ret(model);
  };
});
