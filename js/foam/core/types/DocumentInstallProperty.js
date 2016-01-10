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
  package: 'foam.core.types',
  name: 'DocumentInstallProperty',
  extends: 'Property',

  help: "Describes a function property that runs once per document",

  documentation: function() {/* A special property that is run once per document.
    The value of this property is not used. Set documentInstallFn to a
    function that takes a context as the parameter. When called, 'this'
    will be the runtime prototype of the model that owns this property.</p>
    <p>Effectively, the function that runs on the model is defined as part of
    this property's definition inside the model definition. Since you can't
    control exactly when documentInstallFn is run, you can't control what it
    is set to outside the model definition. */},

  properties: [
    {
      name: 'documentInstallFn',
      type: 'Function',
      documentation: function() {/* The function to call on the host's
        prototype, given context X as a parameter. */},
    },
    ['hidden', true]
  ],

  methods: [
    {
      name: 'initPropertyAgents',
      code: function(proto, fastInit) {
        this.SUPER(proto, fastInit);

        var thisProp = this;
        var DocumentInstallProperty = thisProp.model_;

        // add the agent for this model
        proto.addInitAgent(12, ': install in document ', function(o, X, Y) {
          // o is a a newly created instance of a model that has a DocumentInstallProperty
          var model = o.model_;
          // if not a model instance, no document, or we are already installed
          //   in document, we're done.
          if ( ! model || ! X.installedModels || X.installedModels[model.id] ) return;
          // call this document installer function on the current proto
          thisProp.documentInstallFn.call(proto, X);
        });

        // Also run our base models' DocumentInstallProperty inits, in case no
        // instances of our base models have been created.
        if ( proto.__proto__.model_ ) {
          var recurse = function(baseProto) {
            // if the base model also has/inherits this property, init on base too
            var baseProp = baseProto.model_.getProperty(thisProp.name);
            if ( baseProp ) {
              // add a special init agent that has the proto hardcoded.
              proto.addInitAgent(12, ': inherited install in document ', function(o, X, Y) {
                var model = baseProto.model_;
                if ( ! model || ! X.installedModels || X.installedModels[model.id] ) return;
                baseProp.documentInstallFn.call(baseProto, X);
              });
              // many of these may be added, but won't hurt
              proto.addInitAgent(13, ': completed inherited install in document ', function(o, X, Y) {
                X.installedModels[baseProto.model_.id] = true;
              });
              // continue recursing
              if ( baseProto.__proto__.model_ ) {
                recurse(baseProto.__proto__);
              }
            } // else this property is not declared or inherited at this level, so we are done.
          }
          recurse(proto.__proto__);
        }

        // run after all the install in document agents to mark completion
        proto.addInitAgent(13, ': completed install in document ', function(o, X, Y) {
          X.installedModels[o.model_.id] = true;
        });
      }
    }
  ]
});
