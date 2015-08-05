/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  name: 'ModelListController',

  requires:[
    'MDAO',
    'foam.ui.md.DAOListView',
    'foam.ui.md.TextFieldView',
    'foam.documentation.ModelDescriptionRowView'
  ],

  imports: ['masterModelList as dao'],

  properties: [
    {
      name: 'search',
    },
    {
      name: 'searchView',
      factory: function() {
        return this.TextFieldView.create({ data$: this.search$, label:'Search', onKeyMode: true, displayWidth: 20 });
      }
    },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',

      dynamicValue: function() {
        return this.dao.orderBy(this.order)
            .where(OR(CONTAINS_IC(Model.NAME, this.search), CONTAINS_IC(Model.PACKAGE, this.search)));
      }
    },
    {
      name: 'filteredDAOView',
      factory: function() {
        return this.DAOListView.create({ data$: this.filteredDAO$, rowView: 'foam.documentation.ModelDescriptionRowView', mode: 'read-only' });
      }
    }
  ],


});
