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
  name: 'MetaSelectorView',
  package: 'foam.meta',

  extendsModel: 'foam.ui.md.DetailView',

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        // TODO: model-for-model instead
        this.viewModel = 'foam.meta.types.' + nu.model_.name + 'View';
      }
    },
    {
      model_: 'StringProperty',
      name: 'viewModel',
    }
  ],

  methods: [
    function shouldDestroy() { return true; }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">
        $$data{ model_: this.viewModel }
      </div>
    */},


  ]

});

