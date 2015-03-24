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
  name: 'DocRef',
  package: 'foam.documentation',
  label: 'Documentation Reference',
  documentation: 'A reference to a documented Model or feature of a Model',

  imports: ['documentViewRef', 'masterModelList'],

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
          The a $$DOC{ref:'foam.documentation.DocRef'} based on the fully qualified package and
          outer model names of this resolved reference.
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
      <li>The name after the first ".": a feature of the $$DOC{ref:'Model'} accessible by "getFeature('name')"</li>
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
        if (!this.documentViewRef || !this.documentViewRef.get().resolvedRoot.valid) {
          return; // abort
        } else {
          //  fill in root to make reference absolute, and try again
          return this.resolveReference(this.documentViewRef.get().resolvedRoot.resolvedRef + reference);
        }
      }
      
      var refChunk = ""+reference;
      while (refChunk.length > 0) {
//         this.X.ModelDAO.find(refChunk, { // arequire instead
//             put: function(m) {
//               this.resolveFeature(m, reference);
//             }.bind(this)
//         });
        this.masterModelList.where(EQ(Model.ID, refChunk)).select({ 
            put: function(m) {
              this.resolveFeature(m, reference);
            }.bind(this)
        });

        var slice = refChunk.lastIndexOf('.');
        if (slice == -1) {
          break;
        } else {
          refChunk = refChunk.substring(0, refChunk.lastIndexOf('.'));
        }
      }
      
    },
    
    getInheritanceList: function(model, list) {
      // find all base models of the given model, put into list
      this.X.masterModelList.where(IN(Model.ID, model.traits)).select({
        put: function(p) { list.put(p); },
        eof: function() {
          if ( model.extendsModel ) {
            this.X.masterModelList.where(EQ(Model.ID, model.extendsModel)).select({
                put: function(ext) {
                  list.put(ext);
                  this.getInheritanceList(ext, list);
                }.bind(this)
            }); 
          } else {
            list.eof(); // no more extendsModels to follow, finished
          }          
        }
      });

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
      this.resolvedRoot = this.model_.create({
        resolvedObject: model,
        resolvedRef: newResolvedRef,
        valid: true,
        resolvedRoot: undefined // otherwise it would be the same as 'this'
      });
      
      // if no feature specified, fast return
      if ( features.length == 0 ) {
        this.resolvedRef = newResolvedRef;
        this.resolvedObject = model;
        this.valid = true;
        return;
      }    
      
      // if features specified, async grab ancestor list
      var ancestry = [model];
      this.getInheritanceList(model, {
        put: function(m) { ancestry.put(m); },
        eof: function() {
          // Check for a feature, and check inherited features too
          // If we have a Model definition, we make the jump from definition to an
          // instance of a feature definition here
          var foundObject = null;
          if (features.length > 0) {
            // feature specified "Model.feature" or ".feature"
            ancestry.every(function(ancestor) { 
              foundObject = ancestor.getFeature(features[0]);
              if ( ! foundObject ) {    
                return false;
              } else {
                newResolvedRef += "." + features.shift();
                return true;
              }
            });
          }
    
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
        }.bind(this)
      });
    },      
      
  },

});
