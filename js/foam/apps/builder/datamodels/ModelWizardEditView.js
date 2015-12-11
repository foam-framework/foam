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

  extends: 'foam.apps.builder.datamodels.meta.types.ModelEditView',

  requires: [
    'StringProperty',
    'foam.apps.builder.model.ui.InlineEditView',
    'foam.apps.builder.model.regex.EasyRegex',
  ],

  imports: [
    'newPropText',
  ],
  exports: [
    'properties as dao',
    'selectionGuard as selection',
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
    },
    {
      name: 'selectionGuard',
      defaultValue: '',
    },
    {
      type: 'String',
      name: 'newPropText',
      defaultValue: 'Enter Text'
    }
  ],

  actions: [
    {
      name: 'createButton',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
      isAvailable: function() { return this.mode == 'read-write'; },
      code: function() {
        this.data.properties.put(this.StringProperty.create({
          name: "property_"+this.nextID(),
          label: this.newPropText,
          pattern: this.EasyRegex.create()
        }));
      }
    },
  ],


  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-edit-view-container wizard-floating-action-container">
          <div class="model-edit-view-list">
              $$properties{
                model_: 'foam.ui.md.DAOListView',
                mode: 'read-only',
                rowView: 'foam.apps.builder.model.ui.InlineEditView',
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
