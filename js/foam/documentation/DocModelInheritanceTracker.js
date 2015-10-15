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
  name: 'DocModelInheritanceTracker',
  documentation: 'Stores inheritance information for a Model',
  documentation: function() { /*
      <p>Stores inheritance information for a $$DOC{ref:'Model'}. One
      instance per extending $$DOC{ref:'Model'} is stored in the
      this.featureDAO (starting with the data of
      $$DOC{ref:'DocModelView'}, and following the .extends chain.
      </p>
      <p>See $$DOC{ref:'DocModelView'}.
      </p>
  */},

  ids: ['model'],

  properties: [
    {
      name: 'model',
      documentation: 'The model name.',
      documentation: "The $$DOC{ref:'Model'} name."
    },
    {
      name: 'inheritanceLevel',
      documentation: 'The inheritance level of model.',
      documentation: "The inheritance level of $$DOC{ref:'.model'} (0 = root, no extendsModel specified)",
      defaultValue: 0
    },
  ]
});
