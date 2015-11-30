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
  name: 'PropertyValidateView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.apps.builder.model.ui.ValidateView',

  requires: [
    'foam.ui.md.PopupChoiceView',
  ],

  properties: [
    {
      type: 'DAO',
      name: 'cannedValidators',

    },
    {
      type: 'ViewFactory',
      name: 'validator',
      defaultValue: function(args, X) {
        return this.PopupChoiceView.create({
          data$: this.choice$,
          dao: this.cannedValidators,
          objToChoice: this.validatorToChoice,
        }, X || this.Y);
      }
    },
    {
      name: 'choice',
      postSet: function(old, nu) {
        nu && nu.installOnProperty && nu.installOnProperty(this.data);
      }
    },
  ],

  methods: [
    function validatorToChoice(obj) {
      return [ obj, obj.model_.label ];
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-row">
          %%validator()

        </div>
      </div>
    */},
  ],

});
