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
  package: 'foam.documentation',
  name: 'FeatureListLoaderTrait',

  documentation: 'Trait loads the documentation of the given feature list.',

  requires: [ 'foam.documentation.DocFeatureCollapsedView',
              'foam.documentation.DocFeatureInheritanceTracker' ],

  imports: ['featureDAO', 'documentViewRef'],

  properties: [
    {
      name: 'model',
      documentation: 'The model definition of the items in the data array.'
    },
    {
      name: 'featureType',
      documentation: 'The property name from which data is set (such as "properties" or "methods")',
      type: 'String',
      postSet: function() {
        this.rebuildSelfDAOs();
      }
    },
    {
      name: 'featureDAO',
      model_: 'foam.core.types.DAOProperty',
      onDAOUpdate: function() {
        this.rebuildSelfDAOs();
      }
    },
    {
      name:  'selfFeaturesDAO',
      model_: 'foam.core.types.DAOProperty',
      documentation: function() { /*
          Returns the list of features (matching this feature type) that are
          declared or overridden in this $$DOC{ref:'Model'}
      */},
      onDAOUpdate: function() {
        var self = this;
        this.selfFeaturesDAO.select(COUNT())(function(c) {
          self.hasFeatures = c.count > 0;
        });
      }
    },
    {
      name:  'inheritedFeaturesDAO',
      model_: 'foam.core.types.DAOProperty',
      documentation: function() { /*
          Returns the list of features (matching this feature type) that are
          inherited but not declared or overridden in this $$DOC{ref:'Model'}
      */},
      onDAOUpdate: function() {
        var self = this;
        this.inheritedFeaturesDAO.select(COUNT())(function(c) {
          self.hasInheritedFeatures = c.count > 0;
        });
      }
    },
    {
      name: 'hasFeatures',
      defaultValue: false,
      postSet: function(old, nu) {
        if (old !== nu) {
          this.destroy();
          this.construct();
        }
      },
      documentation: function() { /*
          True if the $$DOC{ref:'.selfFeaturesDAO'} is not empty.
      */}
    },
    {
      name: 'hasInheritedFeatures',
      defaultValue: false,
      postSet: function(old, nu) {
        if (old !== nu) {
          this.destroy();
          this.construct();
        }
      },
      documentation: function() { /*
          True if the $$DOC{ref:'.inheritedFeaturesDAO'} is not empty.
      */}
    }
  ],

  listeners: [
    {
      name: 'rebuildSelfDAOs',
      isMerged: 100,
      code: function() {
        var self = this;
        if ( ! this.documentViewRef ) {
          // console.warn("this.documentViewRef non-existent");
        } else if ( ! this.documentViewRef.get() ) {
          // console.warn("this.documentViewRef not set");
        } else if ( ! this.documentViewRef.get().valid ) {
          // console.warn("this.documentViewRef not valid");
          this.documentViewRef.get().valid$.addListener(this.rebuildSelfDAOs);
        } else {
          this.selfFeaturesDAO = [].sink;
          this.featureDAO
            .where(
                  AND(AND(EQ(this.DocFeatureInheritanceTracker.MODEL, this.documentViewRef.get().resolvedRoot.id),
                          EQ(this.DocFeatureInheritanceTracker.IS_DECLARED, true)),
                      CONTAINS(this.DocFeatureInheritanceTracker.TYPE, this.featureType))
                  )
            .select(MAP(this.DocFeatureInheritanceTracker.FEATURE, this.selfFeaturesDAO));

          this.inheritedFeaturesDAO = [].sink;
          this.featureDAO
            .where(
                  AND(AND(EQ(this.DocFeatureInheritanceTracker.MODEL, this.documentViewRef.get().resolvedRoot.id),
                          EQ(this.DocFeatureInheritanceTracker.IS_DECLARED, false)),
                      CONTAINS(this.DocFeatureInheritanceTracker.TYPE, this.featureType))
                  )
            .select(MAP(this.DocFeatureInheritanceTracker.FEATURE, this.inheritedFeaturesDAO));

          this.destroy();
          this.construct();
        }
      }
    }
  ],

  methods: {
    destroy: function(isParentDestroyed) {
      if ( isParentDestroyed ) {
        this.featureDAO = null;
        this.documentViewRef = null;
      }

      this.SUPER(isParentDestroyed);
    }
  }
});
