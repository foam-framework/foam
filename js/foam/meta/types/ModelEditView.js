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
  name: 'ModelEditView',
  package: 'foam.meta.types',

  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.meta.types.EditView',
    'foam.meta.types.BooleanPropertyEditView',
    'foam.meta.types.IntPropertyEditView',
    'foam.meta.types.FloatPropertyEditView',
    'foam.meta.types.PropertyEditView',
    'foam.meta.types.StringPropertyEditView',
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id">
        <h2>Model</h2>
        <div>
          $$name{ model_: 'foam.ui.TextFieldView' }
        </div>
        <div>
          $$properties{ model_: 'foam.ui.DAOListView', rowView: 'foam.meta.types.EditView' }
        </div>
      </div>
    */},


  ]

});

