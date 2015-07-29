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
    'foam.ui.md.UpdateDetailView',
    'foam.meta.MetaPropertyDescriptor',
  ],

  imports: ['stack'],
  exports: [' as dao'],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        // allow direct editing of the properties array by setting up listeners
        if ( nu && nu.properties ) {
          nu.properties.forEach(function(p) {
            p.addListener(this.subObjectChange);
          }.bind(this));
        }
        if ( old && old.properties ) {
          old.properties.forEach(function(p) {
            p.removeListener(this.subObjectChange);
          }.bind(this));
        }
      }
    },
  ],

  actions: [
    {
      name: 'createButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
      //isAvailable: function() { return this.data.showAdd; },
      action: function() {
        var edit = this.UpdateDetailView.create({
          data: this.MetaPropertyDescriptor.create(),
          exitOnSave: true,
        });
        this.stack.pushView(edit);
      }
    },
  ],

  listeners: [
    {
      name: 'subObjectChange',
      code: function() {
        this.data.propertyChange('properties', null, this.data.properties);
      }
    },
  ],

  methods: [
    function put(o, sink) {
      var prop = o.model.create({ name: o.name });
      this.data.properties.put(prop);
      sink && sink.put(prop);
      //this.stack.popView();
    },
    function remove(o, sink) {
      this.data.properties.remove(o, sink);
    },
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
            $$properties{ model_: 'foam.ui.DAOListView', mode: 'read-only', rowView: 'foam.meta.types.EditView' }
          </div>
        </div>
        <div class="floating-action">
          $$createButton{
            className: 'createButton',
            color: 'white',
            font: '30px Roboto Arial',
            alpha: 1,
            width: 44,
            height: 44,
            radius: 22,
            background: '#e51c23'
          }
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

