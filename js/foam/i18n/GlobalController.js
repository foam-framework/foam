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
  name: 'GlobalController',
  package: 'foam.i18n',

  requires: [
    'foam.i18n.ChromeMessagesBuilder',
    'foam.i18n.ChromeMessagesExtractor'
  ],

  imports: [
    'console'
  ],

  properties: [
    {
      name: 'builders',
      factory: function() {
        return this.getBuilders();
      }
    },
    {
      name: 'extractors',
      factory: function() {
        return this.getExtractors();
      }
    },
    {
      name: 'buildersList',
      factory: function() { return []; }
    },
    {
      name: 'extractorsList',
      factory: function() { return []; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        var self = this;
        ['builders', 'extractors'].forEach(function(baseName) {
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
        var afuncs = [];
        [
          {
            name: 'USED_MODELS',
            coll: USED_MODELS
          },
          {
            name: 'UNUSED_MODELS',
            coll: UNUSED_MODELS
          }
        ].forEach(function(coll) {
          if (!coll.coll) {
            self.console.warn('Global 18n Controller: Attempt to visit ' +
                'missing model collection: "' + coll.name + '"');
            return;
          }
          Object.getOwnPropertyNames(coll.coll).forEach(
              function(modelName) {
                afuncs.push(arequire(modelName).aseq(function(ret, model) {
                  self.visitModel(visitors, model);
                  ret();
                }));
              });
        });
        return apar.apply(null, afuncs);
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
      name: 'getBuilders',
      code: function() {
        return {
          chromeMessages: this.ChromeMessagesBuilder.create()
        };
      }
    },
    {
      name: 'getExtractors',
      code: function() {
        return {
          chromeMessages: this.ChromeMessagesExtractor.create()
        };
      }
    }
  ]
});

X.i18nModel = (function() {
  var i18nGC = X.foam.i18n.GlobalController.create();
  i18nGC.visitAllCurrentModels(
      i18nGC.buildersList.concat(i18nGC.extractorsList))(anop);
  return function(model, X, ret) {
    i18nGC.visitModel(i18nGC.buildersList.concat(i18nGC.extractorsList), model);
    ret && ret(model);
  };
})();
