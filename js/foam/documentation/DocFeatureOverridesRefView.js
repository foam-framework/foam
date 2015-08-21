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
  name: 'DocFeatureOverridesRefView',
  extendsModel: 'foam.documentation.DocRefView',
  label: 'Documentation Feature Overrides Reference Link View',
  help: "The view of a documentation reference link based on a Model's overrides.",

  documentation: function() { /*
    An inline link to another place in the documentation. See $$DOC{ref:'DocView'}
    for notes on usage. Set $$DOC{ref:'.data'} to be a DocFeatureInheritanceTracker instance.
  */},

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        this.ref = this.data.model + "." + this.data.name;
        this.text = (this.data.fromTrait? "(T)" : "") + this.data.model;
      }
    }
  ]
});
