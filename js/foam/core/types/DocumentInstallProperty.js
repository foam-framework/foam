/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  extendsModel: 'FunctionProperty',

  name: 'DocumentInstallProperty',
  help: "Describes a function property that runs once per document",

  documentation: function() {/* A function property that is run once per document.
    The value of this property should be a function that takes a context as the
    parameter. When called, 'this' will be the runtime prototype of the model
    that owns this property. */},

  package: 'foam.core.types',

  // TODO: add prop that is the actual function to run, and ignore the value
  // the user might assign to this property? As in, lock the function value to
  // the model definition's settings for this property.

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
          o[thisProp.name].call(proto, X);
        });

        // Also run our base models' DocumentInstallProperty inits, in case no
        // instances of our base models have been created.
        if ( proto.__proto__.model_ && ! X.installedModels[proto.__proto__.model_.id] ) {
          var recurse = function(baseProto) {
            // if the base model also has/inherits this property, init on base too
            if ( baseProto.model_.getProperty(thisProp.name) ) {
              // add a special init agent that has the proto hardcoded.
              proto.addInitAgent(12, ': inherited install in document ', function(o, X, Y) {
                var model = baseProto.model_;
                if ( ! model || ! X.installedModels || X.installedModels[model.id] ) return;
                // we we inherit the same property, we can grab the function value from
                // our specific instance (TODO: jacksonic a little ambiguous what happens
                // if we change the function value in our create args, changing the value our
                // base would have seen had it been created on its own?)
                o[thisProp.name].call(baseProto, X);
              });
            }
            // many of these may be added, but won't hurt
            proto.addInitAgent(13, ': completed inherited install in document ', function(o, X, Y) {
              X.installedModels[baseProto.model_.id] = true;
            });
            // continue recursing
            if ( baseProto.__proto__.model_ && ! X.installedModels[baseProto.__proto__.model_.id] ) {
              recurse(baseProto.__proto__);
            }
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
