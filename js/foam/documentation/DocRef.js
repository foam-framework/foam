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
  name: 'DocRef',
  label: 'Documentation Reference',
  documentation: 'A reference to a documented Model or feature of a Model',

  imports: ['documentViewRef', '_DEV_ModelDAO', 'masterModelList'],

  documentation: function() { /*
    <p>A link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    <p>Every reference must have documentViewRef set on the context.
      This indicates the starting point of the reference for relative name
      resolution.</p>
    */},

  properties: [
    {
      name: 'resolvedObject',
      documentation: function() { /*
        If this $$DOC{ref:'foam.documentation.DocRef'} is valid, the actual
        instance that the link points to. It may be a $$DOC{ref:'Model'},
        $$DOC{ref:'Method'}, $$DOC{ref:'Property'}, or other feature type.
      */}
    },
    {
      name: 'resolvedRef',
      defaultValue: "",
      documentation: function() { /*
          The fully qualified name of the resolved reference, in the
          same format as $$DOC{ref:'.ref'}. It may match $$DOC{ref:'.ref'},
          if it was fully qualified (began with package, or Model name if no package).
      */}
    },
    {
      name: 'resolvedRoot',
      defaultValue: "",
      documentation: function() { /*
          The owner model of the reference, not including features.
      */}
    },
    {
      name: 'resolvedRootRef',
      defaultValue: "",
      documentation: function() { /*
          The owner model id, which is a valid reference to $$DOC{ref:'.resolvedRoot'}.
      */}
    },
    {
      name: 'ref',
      documentation: 'The reference to link. Must be of the form "Model", "Model.feature", or ".feature"',
      postSet: function() {
        this.resolveReference(this.ref);
      },
      documentation: function() { /*
        The string reference to resolve.
      */}
    },
    {
      name: 'valid',
      defaultValue: false,
      documentation: function() { /*
        Indicates if the reference is valid. $$DOC{ref:'.resolveReference'} will set
        $$DOC{ref:'.valid'} to true if resolution succeeds and
        $$DOC{ref:'.resolvedObject'} is usable, false otherwise.
      */}
    }
  ],

  methods: {
    resolveReference: function(reference, abortOnFail) {
  /* <p>Resolving a reference has a few special cases at the start:</p>
    <ul>
      <li>Beginning with ".": relative to $$DOC{ref:'Model'} in X.documentViewRef</li>
      <li>Containing only ".": the $$DOC{ref:'Model'} in X.documentViewRef</li>
      <li>The name after the first ".": a feature of the $$DOC{ref:'Model'} accessible by "getMyFeature('name')"</li>
      <li>A double-dot after the $$DOC{ref:'Model'}: Skip the feature lookup and find instances directly on
            the $$DOC{ref:'Model'} definition (<code>MyModel.chapters.chapName</code>)</li>
    </ul>
    <p>Note that the first name is a Model definition (can be looked up by this.X[modelName]),
     while the second name is an instance of a feature on that Model, and subsequent
     names are sub-objects on those instances.</p>
  */
      this.valid = false;

      if (!reference) return;

      args = reference.split('.');
      var foundObject;
      var model;
      var modelId;

      // if model not specified, use parentModel
      if (args[0].length <= 0) {
        if (!this.documentViewRef || !this.documentViewRef.get().valid) {
          return; // abort
        } else {
          //  fill in root to make reference absolute, and try again
          return this.resolveReference(this.documentViewRef.get().resolvedRootRef + reference);
        }
      }

      // Find the Model id in the reference
      // ----
      // we check the in-memory list first since we are resolving an ambiguous name, and
      // spam the dao with reqests that we know may fail when trying to find the valid
      // model name within the reference.
      var finished = false;
      var finder = function(refChunk, dao, fallbackDao) {
        //console.log('DocRef chunk: ', refChunk);
        dao.find(refChunk, {
          put: function(m) {
            finished = true;
            this.resolveFeature(m, reference);
          }.bind(this),
          error: function() {
            var slice = refChunk.lastIndexOf('.');
            //console.log("DocRef chunk bad: ", refChunk, slice);
            if (slice == -1) {
              if ( fallbackDao ) {
                //console.log('DocRef fallback with: ', refChunk);
                finder(reference, fallbackDao, null);
              } else {
                console.warn("DocRef could not load ", reference);
              }
            } else {
              //console.log('DocRef recurse with: ', refChunk.substring(0, refChunk.lastIndexOf('.')), refChunk.lastIndexOf('.'));
              finder(refChunk.substring(0, refChunk.lastIndexOf('.')), dao, fallbackDao);
            }
          }.bind(this)
        });
      }.bind(this);

      // try to load the name, starting with the full name
      // and removing the last .chunk after each failure
      // until we have found the model, or we can't find it at all
      var modelDAO = this.X._DEV_ModelDAO ? this.X._DEV_ModelDAO : this.X.ModelDAO;
      finder(reference, this.masterModelList, modelDAO);

    },

    getInheritanceList: function(model, list) {
      // find all base models of the given model, put into list
      var findFuncs = [];
      model.traits.forEach(function(t) {
        findFuncs.push(function(ret) {
          var modelDAO = this.X._DEV_ModelDAO ? this.X._DEV_ModelDAO : this.X.ModelDAO;
          modelDAO.find(t, {
            put: function(m) { list.put(m); ret && ret(); },
            error: function() { console.warn("DocRef could not load trait ", t); ret && ret(); }
          });
        }.bind(this));
      }.bind(this));
      // runs the trait finds first, and when they are done recurse to the next ancestor
      apar.apply(this, findFuncs)(function() {
        if ( model.extends ) {
          var modelDAO = this.X._DEV_ModelDAO ? this.X._DEV_ModelDAO : this.X.ModelDAO;
          modelDAO.find(model.extends, {
              put: function(ext) {
                list.put(ext);
                this.getInheritanceList(ext, list);
              }.bind(this),
              error: function() { console.warn("DocRef could not load model ", t); ret && ret(); }
          });
        } else {
          list.eof(); // no more extendsModels to follow, finished
        }
      }.bind(this));
    },

    resolveFeature: function(m, reference) {
      var model = m;
      var newResolvedRef = m.id;
      var featureName = reference.replace(model.id, "");
      if ( featureName.charAt(0) == '.' ) featureName = featureName.slice(1);

      var features = featureName ? featureName.split('.') : [];

      // check for inner models
      while (features.length > 0 && model) {
        if (model[features[0]] &&
            model[features[0]].model_ &&
            model[features[0]].model_.id == 'Model') {
          model = model[features[0]];
          newResolvedRef += '.' + features.shift();
        } else {
          break;
        }
      }

      // inner models (if present) have been accounted for, so we have our root model
      this.resolvedRoot =  model;
      this.resolvedRootRef = newResolvedRef;

      // if no feature specified, fast return
      if ( features.length == 0 ) {
        this.resolvedRef = newResolvedRef;
        this.resolvedObject = model;
        this.valid = true;
        return;
      }

      var foundObject = null;
      var completeResolve = function() {
        // allow further specification of sub properties or lists
        if ( foundObject && features.length > 0 ) {
          if ( ! features.every(function (arg) {
              var newObject;

              // null arg is an error at this point
              if ( arg.length <= 0 ) return false;

              // check if arg is the name of a sub-object of foundObject
              var argCaller = Function('return this.'+arg);
              if (argCaller.call(foundObject)) {
                newObject = argCaller.call(foundObject);

              // otherwise if foundObject is a list, check names of each thing inside
              } else if (foundObject.mapFind) {
                foundObject.mapFind(function(f) {
                  if (f && f.name && f.name === arg) {
                    newObject = f;
                  }
                })
              }
              foundObject = newObject; // will reset to undefined if we failed to resolve the latest part
              if ( ! foundObject ) {
                return false;
              } else {
                newResolvedRef += "." + arg;
                return true;
              }
            })) {
            return; // the loop failed to resolve something
          }
        }

        this.resolvedRef = newResolvedRef;
        this.resolvedObject = foundObject;
        this.valid = true;
      }.bind(this);

      if ( Model.isInstance(model) ) {
        // if features specified, async grab ancestor list
        var ancestry = [model];
        this.getInheritanceList(model, {
          put: function(m) { ancestry.put(m); },
          eof: function() {
            // Check for a feature, and check inherited features too
            // If we have a Model definition, we make the jump from definition to an
            // instance of a feature definition here
            foundObject = null;
            if (features.length > 0) {
              // feature specified "Model.feature" or ".feature"
              ancestry.every(function(ancestor) {
                foundObject = ancestor.getRawFeature(features[0]);
                if ( ! foundObject ) {
                  return true;
                } else {
                  newResolvedRef += "." + features.shift();
                  return false;
                }
              });
            }

            completeResolve();
          }.bind(this)
        });
      } else {
        // for non-models, just look at sub-features
        foundObject = model;
        completeResolve();
      }
    },

  },

});
