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
  name: 'DocFeatureInheritanceTracker',
  documentation: 'Stores inheritance information for a feature of a Model',
  documentation: function() { /*
      <p>Stores inheritance information for a feature of a $$DOC{ref:'Model'}
          in the this.featureDAO.
      </p>
      <p>See $$DOC{ref:'DocModelView'}.
      </p>
  */},

  requires: ['foam.documentation.DocModelInheritanceTracker as DocModelInheritanceTracker'],

  imports: ['modelDAO'],

  ids: [ 'primaryKey' ],

  properties: [
    {
      name: 'name',
      documentation: "The feature name. This could be a $$DOC{ref:'Method'}, $$DOC{ref:'Property'}, or other feature. Feature names are assumed to be unique within the containing $$DOC{ref:'Model'}.",
      defaultValue: "",
      postSet: function() {
        this.primaryKey = this.model + ":::" + this.name;
      }
    },
    {
      name: 'isDeclared',
      documentation: "Indicates that the feature is declared in the containing $$DOC{ref:'Model'}.",
      defaultValue: false
    },
    {
      name: 'type',
      documentation: "The type ($$DOC{ref:'Model.name', text:'Model name'} string) of the feature, such as $$DOC{ref:'Property'} or $$DOC{ref:'Method'}."
    },
    {
      name: 'feature',
      documentation: "A reference to the actual feature.",
      postSet: function() {
        this.name = this.feature.name;
      }
    },
    {
      name: 'modelDAO'
    },
    {
      name: 'model',
      documentation: 'The name of the Model to which the feature belongs.',
      documentation: "The name of the $$DOC{ref:'Model'} to which the feature belongs.",
      postSet: function() {
        this.primaryKey = this.model + ":::" + this.name;
      }
    },
    {
      name: 'primaryKey',
      defaultValue: ''
    },
    {
      name: 'inheritanceLevel',
      documentation: "Helper to look up the inheritance level of $$DOC{ref:'.model'}",
      getter: function() {
        var modelTracker = [];
        this.modelDAO.where(EQ(this.DocModelInheritanceTracker.MODEL, this.model))
            .select(modelTracker);
        this.instance_.inheritanceLevel = modelTracker[0].inheritanceLevel;
        return this.instance_.inheritanceLevel;
      }
    },
    {
      name: 'fromTrait',
      documentation: 'Indicates if the feature was inherited from a trait.',
      type: 'Boolean',
      defaultValue: false
    }
  ],
  methods: {
    toString: function() {
      return this.model + ": " + this.name + ", " + this.isDeclared;
    }
  }
});
