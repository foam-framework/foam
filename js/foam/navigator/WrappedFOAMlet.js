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
  name: 'WrappedFOAMlet',
  extends: 'foam.navigator.FOAMlet',
  package: 'foam.navigator',

  documentation: function() {/* A wrapper for $$DOC{ref:'foam.navigator.FOAMlet'}
    based on existing models. Set data to be your instance, and the override
    or set the FOAMlet properties based on the instance.
  */},

  properties: [
    {
      name: 'data',
      postSet: function(_,nu) {
        this.model = nu.model_;
      }
    },
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'id',
      getter: function() { return this.data && this.data.id; },
      documentation: function() {/* $$DOC{ref:'id'} should match the wrapped object. */},
    },
    {
      name: 'type',
      defaultValueFn: function() { return this.model && this.model.label; },
      documentation: function() {/* Override this to extract the item's model label */}
    },
    {
      name: 'name',
      type: 'String',
      defaultValueFn: function() { return this.data && this.data.name; },
      documentation: function() {/* Override this to extract a useful name */}
    },
    {
      name: 'iconURL',
      documentation: function() {/* Override this to extract a useful icon URL */},
    },
    {
      name: 'lastModified',
      type: 'DateTime',
      tableWidth: 100,
      documentation: function() {/* Override this to extract and/or apply the last
        modified time of the item, or something approximating it.
      */},
    },
    {
      name: 'labels',
      type: 'StringArray',
      factory: function() { return []; },
      documentation: function() {/* Override this to extract useful labels or tags
        from the item.
      */}
    }
  ]

});
