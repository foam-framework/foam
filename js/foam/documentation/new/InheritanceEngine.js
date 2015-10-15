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
  package: 'foam.documentation.new',
  name: 'InheritanceEngine',
  requires: [
    'foam.documentation.new.DocFeatureInheritanceTracker',
  ],

  imports: [
    'FEATURE_TYPES',
    'modelDAO',
  ],

  methods: {
    // Returns a future for this model's docs.
    loadModel: function(modelSource) {
      var modelFuture = afuture();
      if (typeof modelSource === 'string') {
        this.modelDAO.find(modelSource, {
          put: modelFuture.set.bind(modelFuture)
        });
      } else {
        modelFuture.set(modelSource);
      }

      return aseq(modelFuture.get, this.loadModel_.bind(this));
    },

    loadModel_: function(ret, model) {
      // Work my way back to the parentmost model, inheriting back down.
      // Run traits in reverse order, and then up to the superclass.
      // Load the superclass first, if any. Then stack the traits on top of it,
      // and finally this model.
      var self = this;
      aseq(
        function(ret) {
          if (model.extends) {
            self.loadModel(model.extends)(ret);
          } else {
            ret(undefined);
          }
        },
        function(ret, parent) {
          arepeat(model.traits ? model.traits.length : 0, function(ret, i, n) {
            self.modelDAO.find(model.traits[i], {
              put: function(trait) {
                ret(self.buildModel_(trait, parent));
              }
            });
          })(function(traitParent) {
            ret(traitParent || parent);
          });
        },
        function(ret, parent) {
          ret(self.buildModel_(model, parent));
        }
      )(ret);
    },

    buildModel_: function(model, parent) {
      // parent has the same structure as a model spec, with properties, methods
      // and so on. But the values of those keys are objects. Their keys are
      // feature names, and their values are documentation specs.
      var docs = {
        model_: model,
        super_: parent
      };
      for (var i = 0; i < this.FEATURE_TYPES.length; i++) {
        var featureType = this.FEATURE_TYPES[i];
        var features = model[featureType];
        var parentFeatures = parent && parent[featureType];
        var featureMap = {};
        // Add those that are declared on this model.
        for (var j = 0; j < features.length; j++) {
          var feature = features[j];
          featureMap[feature.name] = this.DocFeatureInheritanceTracker.create({
            model: model.id,
            name: feature.name,
            isDeclared: true,
            type: featureType,
            feature: feature,
            fromParent: parentFeatures && parentFeatures[feature.name]
          });
        }

        // And those silently inherited.
        if (parentFeatures) {
          var keys = Object.keys(parentFeatures);
          for (var j = 0; j < keys.length; j++) {
            if (!featureMap[keys[j]]) {
              featureMap[keys[j]] = this.DocFeatureInheritanceTracker.create({
                model: model.id,
                name: keys[j],
                isDeclared: false,
                type: featureType,
                feature: parentFeatures[keys[j]].feature,
                fromParent: parentFeatures[keys[j]]
              });
            }
          }
        }

        docs[featureType] = featureMap;
      }

      return docs;
    }
  },
});
