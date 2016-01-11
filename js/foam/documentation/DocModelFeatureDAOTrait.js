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
  name: 'DocModelFeatureDAOTrait',

  documentation: "Generates a featureDAO of all the inherited features of a $$DOC{ref:'Model'}.",

  requires: [
    'foam.documentation.DocFeatureInheritanceTracker',
    'foam.documentation.DocModelInheritanceTracker',
    'Model',
    'MDAO',
    'foam.dao.FindFallbackDAO'
  ],

  imports: [
    '_DEV_ModelDAO',
    'masterModelList',
    'featureDAO',
    'featureDAOModelsLoading',
    'documentViewRef'
  ],
  exports: [
    'featureDAO',
    'modelDAO',
    'featureDAOModelsLoading',
    'subModelDAO',
    'traitUserDAO',
    '_DEV_ModelDAO',
    'masterModelList',
    'documentViewRef'
  ],

  properties: [
    {
      name: 'featuresToLoad',
      factory: function() {
        return [ 'properties',
          'methods',
          'actions',
          'listeners',
          'models',
          'relationships',
          'templates'];
      }
    },
    {
      name: 'processBaseModels',
      type: 'Boolean',
      defaultValue: true
    },
    {
      name: 'documentViewRef',
      factory: function() {
         return this.SimpleValue.create(
           this.DocRef.create({ ref: this.data ? this.data.id : "" },
             this.Y.sub({ documentViewRef: null })));
      }
    },
    {
      name: '_DEV_ModelDAO',
      lazyFactory: function() {
        return this.FindFallbackDAO.create({delegate: this.masterModelList, fallback: this.X.ModelDAO});
      }
    },
    {
      name: "masterModelList",
      lazyFactory: function() {
        return this.MDAO.create({model:Model});
      }
    },
    {
      name: 'featureDAO',
      model_: 'foam.core.types.DAOProperty',
      lazyFactory: function() {
        return this.MDAO.create({model:this.DocFeatureInheritanceTracker, autoIndex:true});
      }
    },
    {
      name: 'featureDAOModelsLoading',
      lazyFactory: function() {
        return { };
      }
    },
    {
      name: 'modelDAO',
      model_: 'foam.core.types.DAOProperty',
      lazyFactory: function() {
        return this.MDAO.create({model:this.DocModelInheritanceTracker, autoIndex:true});
      }
    },
    {
      name: 'subModelDAO',
      model_: 'foam.core.types.DAOProperty',
      lazyFactory: function() {
        return this.MDAO.create({model:this.Model, autoIndex:true});
      }
    },
    {
      name: 'traitUserDAO',
      model_: 'foam.core.types.DAOProperty',
      lazyFactory: function() {
        return this.MDAO.create({model:this.Model, autoIndex:true});
      }
    }
  ],

  methods: {

    generateFeatureDAO: function(data) {
      /* Builds a feature DAO to sort out inheritance and overriding of
        $$DOC{ref:'Property',usePlural:true}, $$DOC{ref:'Method',usePlural:true},
        and other features. */

      //var startTime = Date.now();
      //console.log("Generating FeatureDAO...", this.data );

      if ( ! data.model_ || data.model_.id !== 'Model' ) {
        console.warn("ModelDocView created with non-model instance: ", data);
        return;
      }

      if ( ! this.Y.modelDAO ) {
        // we aren't done init yet, so wait and our init(); will call us again
        return;
      }

      // console.log("Generating FeatureDAO...", this.data.id );

//       this.featureDAO.removeAll();
//       this.modelDAO.removeAll();
      this.subModelDAO.removeAll();
      this.traitUserDAO.removeAll();
//      this.featureDAOModelsLoading = {};

      // Run through the features in the Model definition in this.data,
      // and load them into the feature DAO. Passing [] assumes we don't
      // care about other models that extend this one. Finding such would
      // be a global search problem.
      if ( this.processBaseModels ) {
        this.Y.setTimeout(function() {
          this.agetInheritanceMap(this.loadFeaturesOfModel, data, { data: data });
        }.bind(this), 20);
      } else {
        this.loadFeaturesOfModel( { data: data } );
      }

      // TODO(jacksonic): relocate submodels and trait users to a different model
//       this.Y.setTimeout(function() {
//           this.findSubModels(data);
//           this.findTraitUsers(data);
//       }.bind(this), 500);

      //console.log("  FeatureDAO complete.", Date.now() - startTime);

      //this.debugLogFeatureDAO();
    },

    agetInheritanceMap: function(ret, model, map) {
      // find all base models of the given model, put into list
      var findFuncs = [];
      model.traits.forEach(function(t) {
        findFuncs.push(function(ret) {
          this._DEV_ModelDAO.find(t, {
            put: function(m) { map[m.id] = m; ret && ret(); },
            error: function() { console.warn("DocModelFeatureDAOTrait could not load trait ", t); ret && ret(); }
          });
        }.bind(this));
      }.bind(this));
      // runs the trait finds first, and when they are done recurse to the next ancestor
      apar.apply(this, findFuncs)(function() {
        if ( model.extends ) {
          this._DEV_ModelDAO.find(model.extends, {
              put: function(ext) {
                map[ext.id] = ext;
                this.agetInheritanceMap(ret, ext, map);
              }.bind(this),
              error: function() { console.warn("DocModelFeatureDAOTrait could not load model ", ext); ret && ret(map); }
          });
        } else {
          ret && ret(map); // no more extendsModels to follow, finished
        }
      }.bind(this));

    },

    debugLogFeatureDAO: function() {
      /* For debugging purposes, prints out the state of the FeatureDAO. */

      var features = [];
      console.log("Features DAO: ", this.featureDAO);
      this.featureDAO.select(features);
      console.log(features);

      var modelss = [];
      console.log("Model    DAO: ", this.modelDAO);
      this.modelDAO.select(modelss);
      console.log(modelss);
    },

    findSubModels: function(data) {
      if ( ! this.Model.isInstance(data) ) return;
      this.findDerived(data);
    },

    findTraitUsers: function(data) {
      if ( ! this.Model.isInstance(data) ) return;

      this._DEV_ModelDAO.select(MAP(
        function(obj) {
          if ( obj.traits &&  obj.traits.indexOf(data.id) > -1 ) {
            this.traitUserDAO.put(obj);
          }
        }.bind(this)
      ));
    },

    destroy: function( isParentDestroyed ) {
      if ( isParentDestroyed ) {
        this.featureDAO = null;
        this.modelDAO = null;
        this.subModelDAO = null;
        this.traitUserDAO = null;
      }
      this.SUPER(isParentDestroyed);
    }
  },

  listeners: [
    {
      name: 'findDerived',
      whenIdle: true,
      code: function(extendersOf) {
        this._DEV_ModelDAO.select(MAP(
          function(obj) {
            if ( obj.extends == extendersOf.id ) {
              this.subModelDAO.put(obj);
              // for performance, spread out the load
              // TODO(jacksonic): disabled recursion for speed
              //this.X.setTimeout(function() { this.findDerived(obj); }.bind(this), 200);
            }
          }.bind(this)
        ));
      }

    },
    {
      name: 'loadFeaturesOfModel',
      code: function(map, previousExtenderTrackers, traitInheritanceLevel) {
        /* <p>Recursively load features of this $$DOC{ref:'Model'} and
          $$DOC{ref:'Model',usePlural:true} it extends.</p>
          <p>Returns the inheritance level of model (0 = $$DOC{ref:'Model'}).
          </p>
          */
        var model = map.data;

        if (typeof previousExtenderTrackers == 'undefined') {
          previousExtenderTrackers = [];
        }
        var isTrait = true;
        if (typeof traitInheritanceLevel == 'undefined') {
          traitInheritanceLevel = 0;
          isTrait = false;
        }
        var modelDef = model.definition_?  model.definition_: model;
        var self = this;
        var newModelTr = this.DocModelInheritanceTracker.create();
        newModelTr.model = model.id;
        // track what is loading, so child daos don't load it again needlessly
        if (   ! this.featureDAOModelsLoading[model.id]
            || ! this.featureDAOModelsLoading[model.id].loading ) {
          this.featureDAOModelsLoading[model.id] = {
            loading: true,
            inheritanceLevel: -1,
            features: {}
          };
        }

        this.featuresToLoad.forEach(function(modProp) {
          // check if someone else has processed the feature, then indicate we have process this feature
          if ( self.featureDAOModelsLoading[model.id].features[modProp] ) return;
          self.featureDAOModelsLoading[model.id].features[modProp] = true;

          var modPropVal = modelDef[modProp];
          if ( Array.isArray(modPropVal) ) { // we only care to check inheritance on the array properties
            modPropVal.forEach(function(feature) {
              if ( feature.name ) { // only look at actual objects
                // all features we hit are declared (or overridden) in this model
                var featTr = self.DocFeatureInheritanceTracker.create({
                      isDeclared:true,
                      feature: feature,
                      model: newModelTr.model,
                      type: modProp,
                      fromTrait: isTrait
                });
                self.featureDAO.put(featTr);

                // for the models that extend this model, make sure they have
                // the feature too, if they didn't already have it declared (overridden).
                // isTrait is not set, as we don't distinguish between inherited trait features and
                // extendsModel features.
                previousExtenderTrackers.forEach(function(extModelTr) {
                  self.featureDAO
                        .where(EQ(self.DocFeatureInheritanceTracker.PRIMARY_KEY,
                                  extModelTr.model+":::"+feature.name))
                        .select(COUNT())(function(c) {
                            if (c.count <= 0) {
                              var featTrExt = self.DocFeatureInheritanceTracker.create({
                                  isDeclared: false,
                                  feature: feature,
                                  model: extModelTr.model,
                                  type: modProp });
                              self.featureDAO.put(featTrExt);
                            }
                        });
                });
              }
            });
          }
        });

        if ( ! isTrait && this.processBaseModels ) {
          // Check if we extend something, and recurse.
          if (!model.extends) {
            newModelTr.inheritanceLevel = 0;
          } else {
            // add the tracker we're building to the list, for updates from our base models
            previousExtenderTrackers.push(newModelTr);
            // inheritance level will bubble back up the stack once we know where the bottom is.
            // pass a copy of previousExtenderTrackers so we know what to update in the traits section after.
            newModelTr.inheritanceLevel = 1 + this.loadFeaturesOfModel(
              { __proto__: map, data: map[model.extends] },
              previousExtenderTrackers.slice(0));
          }

          // Process traits with the same inheritance level we were assigned, since they appear first in the
          // apparent inheritance chain before our extendsModel.
          if (model.traits && model.traits.length > 0) {
            model.traits.forEach(function(trait) {
              var traitExtenderTrackers = previousExtenderTrackers.slice(0);
              traitExtenderTrackers.push(newModelTr);
              this.loadFeaturesOfModel(
                { __proto__: map, data: map[trait] },
                traitExtenderTrackers,
                newModelTr.inheritanceLevel);
            }.bind(this));
          }
        }

        // the tracker is now complete
        this.modelDAO.put(newModelTr);
        this.featureDAOModelsLoading[model.id].inheritanceLevel = newModelTr.inheritanceLevel;
        return newModelTr.inheritanceLevel;
      }

    }
  ]


});
