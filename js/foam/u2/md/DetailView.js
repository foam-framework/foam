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
  package: 'foam.u2.md',
  name: 'DetailView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.md.Checkbox',
    'foam.u2.md.Input',
    'foam.u2.md.Select',
  ],

  exports: [
    'data',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if (nu.model_ !== this.model) this.model = nu.model_;
      },
    },
    {
      name: 'model',
      postSet: function(oldModel, model) {
        console.assert(Model.isInstance(model), 'Invalid model specified for ' + this.name_);
        if ( oldModel !== model )
          this.properties = model.getRuntimeProperties().filter(function(p) { return ! p.hidden; });
      }
    },
    {
      name: 'properties',
    },
  ],

  methods: [
    function init() {
      this.Y.registerModel(this.Checkbox, 'foam.u2.Checkbox');
      this.Y.registerModel(this.Input, 'foam.u2.Input');
      this.Y.registerModel(this.Select, 'foam.u2.Select');
      this.SUPER();
    },
    function initE() {
      this.cls(this.myCls());
      this.add(function(model, properties) {
        return !model ? 'Set model or data.' : properties;
      }.bind(this).on$(this.X, this.model$, this.properties$));
    },
    function elementForFeature(fName) {
      var f = this.model_.getFeature(fName) || this.X.data.model_.getFeature(fName);
      return f ? f.toE(this.Y) : this.E('Unknown feature: ' + fName).style({color: 'red'});
    },
  ]
});
