/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'SimpleDAOController',
  package: 'foam.ui',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.TableView',
  ],
  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'data',
      hidden: true,
    },
    {
      name: 'daoView',
      lazyFactory: function() {
        var view = this.TableView.create({
          data: this.data,
          scrollEnabled: true,
          editColumnsEnabled: true, 
        });
        return view
      },
      postSet: function(o, n) {
        if (o) o.hardSelection$.removeListener(this.onHardSelection);
        if (n) n.hardSelection$.addListener(this.onHardSelection);
      },
    },
    {
      name: 'selection',
      view: 'foam.ui.DetailView',
      lazyFactory: function() {
        return this.data.model.create();
      },
    },
  ],
  actions: [
    {
      name: 'save',
      code: function() {
        this.data.put(this.selection.clone());
        this.resetSelection();
      },
    },
    {
      name: 'deleteSelected',
      isEnabled: function() {
        return this.selection.id;
      },
      code: function() {
        this.data.remove(this.selection);
        this.resetSelection();
      },
    },
    {
      name: 'deleteAll',
      code: function() {
        this.data.removeAll();
        this.resetSelection();
      },
    },
  ],
  listeners: [
    {
      name: 'onHardSelection',
      code: function() {
        if (this.daoView.hardSelection) {
          this.selection = this.daoView.hardSelection.clone();
        }
      },
    },
    {
      name: 'resetSelection',
      code: function() {
        this.selection = this.data.model.create();
        this.daoView.hardSelection = undefined;
      },
    },
  ],
  templates: [
    function toHTML() {/*
      <div style="height: 300px; overflow: hidden;">
        %%daoView
      </div>
      $$deleteAll
      $$selection
      $$save
      $$deleteSelected
    */},
  ]
});
