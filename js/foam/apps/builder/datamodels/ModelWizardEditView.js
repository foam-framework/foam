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
  name: 'ModelWizardEditView',
  package: 'foam.apps.builder.datamodels',

  extendsModel: 'foam.meta.types.ModelEditView',

  requires: [
    'foam.apps.builder.datamodels.PropertyWizard',
    'foam.apps.builder.datamodels.PropertyEditWizard',
    'foam.meta.types.EditView',
    'foam.meta.types.PropertyCitationView',
  ],

  exports: [
    'properties$',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-model-edit-view'
    },
    {
      name: 'properties',
      lazyFactory: function() { return this.data.properties; },
      postSet: function(old, nu) {
        if ( old !== nu ) {
          this.data.properties = nu;
        }
      },
    }
  ],

  actions: [
    {
      name: 'createButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
      isAvailable: function() { return this.mode == 'read-write'; },
      code: function() {
        var edit = this.PropertyWizard.create({
          data: this.PropertyMetaDescriptor.create(),
        }, this.Y.sub({
          dao: { put: this.put.bind(this) } // hide remove(), since it's a new property we don't have already
        }));
        this.stack.pushView(edit);
      }
    },
  ],

  methods: [
    function init() {
      this.Y.set('ModelWizardEditView_foam_meta_types_EditView', this.EditView);
      this.Y.registerModel(this.PropertyEditWizard, 'foam.meta.types.EditView');
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-edit-view-container wizard-floating-action-container">
          <div class="model-edit-view-list">
              $$properties{
                model_: 'foam.ui.md.DAOListView',
                mode: 'read-only',
                rowView: 'foam.meta.types.PropertyCitationView',
               }
          </div>
          <div class="floating-action">
            $$createButton{
              extraClassName: 'wizard-createButton',
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
      </div>
    */},
    function CSS() {/*
      .wizard-createButton {
        position: absolute;
        top: -28px;
        right: calc(-26px + 50%);
        z-index: 10;
        background: rgba(0,0,0,0);
        box-shadow: 3px 3px 3px rgba(0,0,0,0.33);
        border-radius: 30px;
      }
      .md-button.wizard-createButton {
        height: 40px;
      }
      .wizard-floating-action-container {
        position:relative;
        display: flex;
        flex-grow: 1;
      }
      .model-edit-view-list {
        border-top: 1px solid rgba(0,0,0,0.25);
        border-bottom: 1px solid rgba(0,0,0,0.25);
      }

      wizard .model-edit-view-list .meta-citation-view {
        padding-left: 24px;
        padding-right: 24px;
      }

      .md-model-edit-view {
        flex-grow: 99999;
      }
    */}
  ]

});
