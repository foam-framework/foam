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

  imports: ['documentViewRef'],

  documentation: function() { /*
    <p>A link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage.</p>
    <p>Every reference must have documentViewRef set on the context.
      This indicates the starting point of the reference for relative name
      resolution.</p>
    */},

  properties: [
    {
      name: 'resolvedModelChain',
      defaultValue: [],
      documentation: function() { /*
        If this $$DOC{ref:'foam.documentation.DocRef'} is valid, actual instances corresponding each
        part of the reference are in this list. The last item in the list
        is the target of the reference.
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
          outer model names of this resolved reference. Does not contain features
          and ends with this.resolvedModelChain[0].
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
        $$DOC{ref:'.resolvedModelChain'} is usable, false otherwise.
      */}
    }
  ],

  methods: {
    init: function() {
      /* Warns if documentViewRef is missing from the context. */
      if (!this.documentViewRef) {
        //console.log("*** Warning: DocView ",this," can't find documentViewRef in its context "+this.X.NAME);
      } else {
      // TODO: view lifecycle management. The view that created this ref doesn't know
      // when to kill it, so the addListener on the context keeps this alive forever.
      // Revisit when we can cause a removeListener at the appropriate time.
        //        this.documentViewRef.addListener(this.onParentModelChanged);
      }
    },

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
      var errorHandler = function() { 
        if ( abortOnFail) {
          return;
        } else {
          this.X.ModelDAO.find(reference, { 
            put: function(m) {
              if ( m ) {
                m.arequire && m.arequire();
                this.resolveReference(m.id, true);
              }
            }.bind(this)
          });
          return;
        }
      }.bind(this);
  
  
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
        }

        // fill in root to make reference absolute, and try again
        return this.resolveReference(this.documentViewRef.get().resolvedRoot.resolvedRef + reference);

      } else {
        // resolve path and model
        model = this.X[args[0]];
      }

      this.resolvedModelChain = [];
      this.resolvedRef = "";
      var newResolvedModelChain = [];
      var newResolvedRef = "";
      var newResolvedRoot = "";

      if ( ! model ) return;
      // Strip off package or contining Model until we are left with the last
      // resolving Model name in the chain (including inner models).
      // Ex: package.subpackage.ParentModel.InnerModel.feature => InnerModel
      var findingPackages = !model.model_;
      while (args.length > 0 && model && model[args[1]] && (findingPackages || (model[args[1]].model_ && model[args[1]].model_.id == 'Model'))) {
        newResolvedRef += args[0] + ".";
        newResolvedRoot += args[0] + ".";
        args = args.slice(1); // remove package/outerModel part
        model = model[args[0]];
        if (model.model_) findingPackages = false; // done with packages, now check for inner models
      };

      //TODO: do something with the package parts, resolve package refs with no model

      if ( ! model ) {
        errorHandler();
        return;
      }

      newResolvedModelChain.push(model);
      newResolvedRef += model.name;
      newResolvedRoot += model.name;
      // Check for a feature, and check inherited features too
      // If we have a Model definition, we make the jump from definition to an
      // instance of a feature definition here
      if (Model.isInstance(model) && args.length > 1)
      {
        if (args[1].length > 0) {
          // feature specified "Model.feature" or ".feature"
          foundObject = model.getFeature(args[1]);
          if (!foundObject) {
            return;
          } else {
            newResolvedModelChain.push(foundObject);
            newResolvedRef += "." + args[1];
          }
          remainingArgs = args.slice(2);
        }
      } else {
        foundObject = model;
        remainingArgs = args.slice(1);
      }

      // allow further specification of sub properties or lists
      if ( foundObject && remainingArgs.length > 0 ) {
        if ( ! remainingArgs.every(function (arg) {
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
            if (!foundObject) {
              return false;
            } else {
              newResolvedModelChain.push(foundObject);
              newResolvedRef += "." + arg;
              return true;
            }
          })) {
          errorHandler();
          return; // the loop failed to resolve something
        }
      }

//      console.log("resolving "+ reference);
//      newResolvedModelChain.forEach(function(m) {
//        console.log("  ",m.name,m);
//      });

      this.resolvedModelChain = newResolvedModelChain;
      this.resolvedRef = newResolvedRef;
      this.resolvedRoot = this.X.lookup('foam.documentation.DocRef').create({
          resolvedModelChain: [ this.resolvedModelChain[0] ],
          resolvedRef: newResolvedRoot,
          valid: true,
          resolvedRoot: undefined // otherwise it would be the same as 'this'
      });
      this.valid = true;
    },
  },

});
