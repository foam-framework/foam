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
  name: 'InlineEditView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.Toolbar',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupChoiceView',
    'foam.apps.builder.model.ui.PropertyEditView',
    'foam.apps.builder.model.ui.IntPropertyEditView',
    'foam.apps.builder.model.ui.FloatPropertyEditView',
    'foam.apps.builder.model.ui.StringPropertyEditView',
    'foam.apps.builder.model.ui.BooleanPropertyEditView',
    'IntProperty',
    'FloatProperty',
    'BooleanProperty',
    'StringProperty',
  ],

  imports: [
    'dao', // the property array of our model
    'stack',
  ],
  exports: [
    'newToolbar as mdToolbar',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'inline-edit-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
    {
      name: 'newToolbar',
      lazyFactory: function() {
        this.Y.registerModel(this.FlatButton.xbind({
          displayMode: 'ICON_ONLY',
          height: 24,
          width: 24,
        }), 'foam.ui.ActionButton');
        return this.Toolbar.create({ data: this.data });
      },
      postSet: function(old,nu) {
        console.log("Toolbar set: ",nu);
      }
    },
    {
      type: 'ViewFactory',
      name: 'dataTypePicker',
      defaultValue: function(args, X) {
        return this.PopupChoiceView.create({
          data$: this.dataType$,
          dao: [
            this.IntProperty,
            this.FloatProperty,
            this.StringProperty,
            this.BooleanProperty,
          ].dao,
          objToChoice: function(obj) {
            return [obj.id, obj.label];
          },
          autoSetData: false,
        }, X || this.Y);
      }
    },
    {
      name: 'dataType',
      postSet: function(old, nu) {
        if ( old && nu && ( nu !== this.data.model_.id ) ) {
          // new property type set, reconstruct:
          var newProp = this.X.lookup(nu).create(this.data, this.Y);

          var sourceDAO = this.dao;
          if ( sourceDAO.length ) {
            // since we know the dao is actually an array, replace the item
            for (var i=0; i<sourceDAO.length; ++i) {
              if ( sourceDAO[i].id == this.data.id ) {
                sourceDAO[i] = newProp;
                sourceDAO.notify_('remove', [newProp]); // HACK!
                break;
              }
            }
          } else {
            // fallback on actual DAO operations, may affect ordering
            sourceDAO.remove(this.data);
            sourceDAO.put(newProp);
          }
        }
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( nu ) this.dataType = nu.model_.id;
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
    },
    function shouldDestroy(old,nu) {
      return (! old || ! nu) || old.model_.id !== nu.model_.id;
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-row-baseline">
          <div class="inline-edit-view-grow md-subhead">
            $$label{
              model_: 'foam.ui.md.TextFieldView',
              floatingLabel: false,
            }
          </div>
          <div class="md-edit-view-dropdown">
            %%dataTypePicker()
          </div>
          <% this.newToolbar.toHTML(out); %>
        </div>
        $$data{ model_: 'foam.apps.builder.model.ui.EditView',
                model: this.data.model_ }
      </div>
    */},
    function CSS() {/*
      .inline-edit-view {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background: white;
        border: 1px solid rgba(0,0,0,0.5);
      }
      .inline-edit-view toolbar {
        width: unset;
        flex-shrink: 1;
        flex-grow: 0;
        background-color: transparent;
        color: rgba(0,0,0,0.75);
        margin-top: -8px;
        margin-right: -8px;
      }
      .inline-edit-view-grow {
        flex-grow: 1;
      }
      .md-edit-view-dropdown {
        min-width: 200px;
      }
    */},

  ]

});
