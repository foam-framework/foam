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
    'foam.i18n.ChromeMessagesExtractor',
    'foam.i18n.ChromeMessagesInjector'
  ],

  imports: [
    'console'
  ],

  properties: [
    {
      name: 'extractors',
      factory: function() {
        return this.getExtractors();
      }
    },
    {
      name: 'injectors',
      factory: function() {
        return this.getInjectors();
      }
    },
    {
      name: 'extractorsList',
      factory: function() { return []; }
    },
    {
      name: 'injectorsList',
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        var self = this;
        ['extractors', 'injectors'].forEach(function(baseName) {
          Events.map(
              self[baseName + '$'],
              self[baseName + 'List$'],
              function(hash) {
                var arr = [];
                Object.getOwnPropertyNames(hash).forEach(function(key) {
                  arr.push(hash[key]);
                });
                return arr;
              });
        });
      }
    },
    {
      name: 'visitAllCurrentModels',
      code: function(visitors) {
        var self = this;
        Object_forEach(USED_MODELS, function(_, modelName) {
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
    },
    {
      name: 'getExtractors',
      code: function() {
        return {
          chromeMessages: this.ChromeMessagesExtractor.create()
        };
      }
    },
    {
      name: 'getInjectors',
      code: function() {
        return {
          chromeMessages: this.ChromeMessagesInjector.create()
        };
      }
    }
  ]
});

arequire('foam.i18n.GlobalController')(function(GlobalController) {
  var i18nGC = GlobalController.create();
  // TODO(markdittmer): We need a more reasonable way to trigger extraction.
  // i18nGC.visitAllCurrentModels(
  //   i18nGC.extractorsList.concat(i18nGC.injectorsList));
  window.X.i18nModel = function(model, X, ret) {
    i18nGC.visitModel(
        // i18nGC.extractorsList.concat(
            i18nGC.injectorsList
            // )
        , model);
    ret && ret(model);
  };
});
