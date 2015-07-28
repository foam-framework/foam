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

  extendsModel: 'foam.meta.types.EditView',

  requires: [
    'foam.meta.types.BooleanPropertyEditView',
    'foam.meta.types.IntPropertyEditView',
    'foam.meta.types.FloatPropertyEditView',
    'foam.meta.types.PropertyEditView',
    'foam.meta.types.StringPropertyEditView',
  ],



  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-edit-view-container">
          <div class="md-heading md-model-edit-view-heading">
            <h2>Model</h2>
              <div>
                $$name{ model_: 'foam.ui.TextFieldView' }
              </div>
          </div>
          <div class="model-edit-view-list">
            $$properties{ model_: 'foam.ui.DAOListView', rowView: 'foam.meta.types.EditView' }
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-edit-view-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .md-model-edit-view-heading {
        flex-shrink: 0;
      }
      .model-edit-view-list {
        background: grey;
        overflow-y: scroll;
        flex-grow: 1;
      }
    */}
  ]

});

