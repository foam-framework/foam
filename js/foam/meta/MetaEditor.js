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
  package: 'foam.meta',

  requires: [
    'foam.meta.DetailView',
    'foam.ui.TableView',
    'Model',
    'Property',
    'BooleanProperty',
  ],

  properties: [
    {
      name: 'modelDefinition',
      mode: 'read-write',
      view: 'foam.meta.DetailView',
      metaPriority: 0,
      factory: function() {
        return this.Model.create({
          name: 'NewModel',
          properties: [
            this.BooleanProperty.create({ name: '_newProperty_' })
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
      this.modelView$ = this.modelDefinition$;
    },
  ],

  actions: [
    {
      name: 'addProperty',
      action: function() {
        this.modelDefinition.properties.put(this.BooleanProperty.create({ name: '_newProperty_' }));
      }
    },
    {
      name: 'refresh',
      action: function() {
        var tmp = this.modelDefinition;
        this.modelDefinition = this.Model.create();
        this.modelDefinition = tmp;
      }
    },
  ]

});

