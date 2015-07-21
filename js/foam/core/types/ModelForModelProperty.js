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
  extendsModel: 'Property',

  name: 'ModelForModelProperty',
  help: 'List of model-for-model replacements of the form "baseModel and specifierModel". They will be replaced with this model.',

  documentation: function() {/*
    The model-for-model replacements of the form "baseModel and specifierModel", where
    the resulting $$DOC{ref:'Model'} is this.</p><p>Each entry in the list is equivelent to
    <code>X.registerModelForModel(baseModel, specifierModel, thisModel);</code> at
    creation time, on the instance's subcontext (this.Y).
  */},

  package: 'foam.core.types',

  properties: [
    {
      name: 'replaces',
      model_: 'StringArrayProperty',
    }
  ],

  methods: [
    {
      name: 'register',
      code: function(X) {
        var model = X.lookup(this.modelId);
        if (model) return this.register_(model, X);
      }
    },
    {
      name: 'registerMyRequires',
      code: function(X, model) {
        /* Triggers the register() method of the model-for-model property
         on each required model. The property name must match this one. */
        var thisModel = model || X.lookup(this.modelId);
        if (thisModel) {
          var reqs = thisModel.requires;
          if ( reqs ) {
            for (var i = 0; i < reqs.length; ++i) {
              var req = X.lookup(reqs[i]);
              if (req){
                var rProp = req[constantize(this.name)];
                if (rProp && rProp.register_) {
                  if (rProp.register_(req, X)) { // if register_ wasn't redundant
                    rProp.registerMyRequires(X); // recurse into its dependencies
                  }
                } else {
                  // not an MforM equipped model, but it might require one...
                  this.registerMyRequires(X, req);
                }
              }
            }
          }
        }
      }
    },
    {
      name: 'initPropertyAgents',
      code: function(proto, fastInit) {
        this.SUPER(proto, fastInit);

        // add the agent for this model
        proto.addInitAgent(1, ': registerModelForModel ', function(o, X, m) {
          // o is a a newly created instance of a model that has a ModelForModelProperty
          if (this.register_(proto.model_, X)) {
            this.registerMyRequires(X, proto.model_);
          }
        }.bind(this));
      }
    },
    {
      name: 'register_',
      code: function(model, X) {
        // call on the property: DetailView.REPLACEMENTS.register(DetailView, this.X);
        // register the given models
        var change = true; // force recursion if we have no list of our own
        var regList = this.replaces;
        if ( regList && regList.length > 0 ) {
          change = false; // there's a list, so we can tell if we've registered it already on X
          for (var i = 0; i < regList.length; ++i) {
            var strs = regList[i].split(" and ");
            if ( strs[0] && strs[1] ) {
              change = X.registerModelForModel(strs[0], strs[1], model.id) || change;
//console.log("Reg'd", strs[0], strs[1], model.id, X.$UID);
            }
          }
        }
        return change;
      }
    }

  ]
});
