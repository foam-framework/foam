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
  name: 'MetaEditor',
  package: 'foam.apps.builder.datamodels.meta',

  requires: [
    'BooleanProperty',
    'StringProperty',
    'IntProperty',
    'FloatProperty',
    'DateProperty',
    'Model',
    'foam.apps.builder.datamodels.meta.types.ModelEditView',
    'foam.ui.TableView',
    'foam.ui.md.SharedStyles',
  ],

  properties: [
    {
      name: 'modelDefinition',
      mode: 'read-write',
      view: 'foam.apps.builder.datamodels.meta.types.ModelEditView',
      factory: function() {
        return this.Model.create({
          name: 'NewModel',
          properties: [
            this.BooleanProperty.create({ name: 'boolprop' }),
            this.StringProperty.create({ name: 'stringprop' }),
            this.IntProperty.create({ name: 'intprop' }),
            this.FloatProperty.create({ name: 'floatprop' }),
            this.DateProperty.create({ name: 'dateprop' }),
          ]
        });
      },
    },
    {
      name: 'modelView',
      mode: 'read-only',
      view: 'foam.ui.md.DetailView',
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.SharedStyles.getProperty('installCSS').documentInstallFn.call(
        this.SharedStyles.getPrototype(), this.X);

      this.modelDefinition.addListener(this.refresh);
      this.modelDefinition.properties.dao.listen({ put: this.refresh.bind(this) });

      this.refresh();
    },
  ],

  actions: [
    {
      name: 'addProperty',
      code: function() {
        this.modelDefinition.properties.put(this.BooleanProperty.create({ name: '_newProperty_' }));
      }
    },
    {
      name: 'refresh',
      code: function() {
        delete this.modelDefinition.instance_.prototype_;
        this.modelView = this.Model.create();
        this.modelView = this.modelDefinition.create();

      }
    },
  ],

  templates: [
    function toDetailHTML() {/*
      <div id="%%id" style="display: flex; display: -webkit-flex">
        <div style="padding: 20px; flex-grow: 1; -webkit-flex-grow: 1">
          $$modelDefinition
        </div>
        <div style="padding: 20px; flex-grow: 1; -webkit-flex-grow: 1">
          $$modelView
        </div>
      </div>
    */}
  ]

});
