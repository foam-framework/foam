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
  package: 'foam.apps.builder.datamodels.meta.types',

  extends: 'foam.apps.builder.datamodels.meta.types.EditView',

  requires: [
    'foam.apps.builder.datamodels.meta.types.BooleanPropertyEditView',
    'foam.apps.builder.datamodels.meta.types.IntPropertyEditView',
    'foam.apps.builder.datamodels.meta.types.FloatPropertyEditView',
    'foam.apps.builder.datamodels.meta.types.PropertyEditView',
    'foam.apps.builder.datamodels.meta.types.StringPropertyEditView',
    'foam.apps.builder.datamodels.meta.types.PhoneNumberPropertyEditView',
    'foam.apps.builder.datamodels.meta.types.ImagePropertyEditView',
    'foam.ui.md.UpdateDetailView',
    'foam.apps.builder.datamodels.meta.descriptor.PropertyMetaDescriptor',
    'foam.apps.builder.datamodels.meta.descriptor.MetaDescriptorView',
    'foam.ui.md.PopupChoiceView',
    'foam.ui.md.DAOListView',
    'foam.apps.builder.datamodels.meta.types.CitationView',
  ],

  imports: ['stack'],
  exports: [
    ' as dao',
    'metaEditModelTitle',
    'metaEditPropertyTitle',
    'mode',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-model-edit-view'
    },
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
    {
      name: 'metaEditModelTitle',
      defaultValue: 'Edit Model',
    },
    {
      name: 'metaEditPropertyTitle',
      defaultValue: 'Edit Property',
    },

  ],

  actions: [
    {
      name: 'createButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
      isAvailable: function() { return this.mode == 'read-write'; },
      code: function() {
        this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
        var edit = this.UpdateDetailView.create({
          data: this.PropertyMetaDescriptor.create(),
          exitOnSave: true,
          innerView: 'foam.apps.builder.datamodels.meta.descriptor.MetaDescriptorView',
        }, this.Y.sub({
          dao: { put: this.put.bind(this) } // hide remove(), since it's a new property we don't have already
        }));
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
      /* TODO: this is only used by the create action's view */
      if ( ! o.model ) return;
      var prop = this.X.lookup(o.model).create({ name: o.name });
      this.data.properties.put(prop);
      prop.addListener(this.subObjectChange);
      this.subObjectChange();

      sink && sink.put(prop);
    },
    function remove(o, sink) {
      /* TODO: this is only used by delete actions on property citation views */
      this.data.properties.remove(o, {
        remove: function(p) {
          p.removeListener(this.subObjectChange);
          sink && sink.remove(p);
        }.bind(this)
      });
      this.subObjectChange();
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-edit-view-container">
          <!--<div class="md-heading md-model-edit-view-heading">
            <div class="meta-edit-heading md-style-trait-standard">
              $$metaEditModelTitle{ model_: foam.ui.TextFieldView, mode:'read-only' }
            </div>
          </div>-->
          <div class="model-edit-view-list">
            $$properties{ model_: 'foam.ui.md.DAOListView', mode: 'read-only', rowView: 'foam.apps.builder.datamodels.meta.types.CitationView' }
          </div>
        </div>
        <div class="floating-action">
          $$createButton{
            extraClassName: 'floatingActionButton',
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
      .md-model-edit-view {
        flex-grow: 1;
        display: flex;
        position: relative;
      }
      .md-model-edit-view-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .md-model-edit-view-heading {
        flex-shrink: 0;
      }
      .model-edit-view-list {
        flex-grow: 1;
        display: flex;
        overflow-y: auto;
        flex-basis: 0;
      }

      .md-model-edit-view h2 {
        font-size: 120%;
        color: #777;
      }
    */}
  ]

});
