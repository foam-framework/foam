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
    'toolbar as mdToolbar',
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
      name: 'toolbar',
      lazyFactory: function() {
        this.Y.registerModel(this.FlatButton.xbind({
          displayMode: 'ICON_ONLY',
          height: 24,
          width: 24,
        }), 'foam.ui.ActionButton');
        return this.Toolbar.create({ data: this.data });
      }
    },
    {
      type: 'ViewFactory',
      name: 'dataTypePicker',
      defaultValue: function(args, X) {
        console.log("picker",this.dataType.id);
        return this.PopupChoiceView.create({
          data: this.dataType,
          dao: [
            this.IntProperty,
            this.FloatProperty,
            this.StringProperty,
            this.BooleanProperty,
          ].dao,
          objToChoice: function(obj) {
            return [obj, obj.label];
          },
        }, X || this.Y);
      }
    },
    {
      name: 'dataType',
      postSet: function(old, nu) {
        if ( old && nu && ( nu.id !== this.data.model_.id ) ) {
          // new property type set, reconstruct:
          var newProp = nu.create(this.data, this.Y);

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
        if ( nu ) {
          console.log("edit data",nu.model_.name);
          this.dataType = nu.model_;
        }
      }
    },
  ],

  actions: [
    {
      name: 'delete',
      help: 'Delete this item.',
      ligature: 'delete',
      isAvailable: function() {
        return (this.mode == 'read-write') &&
          (this.dao && this.dao.remove);
      },
      code: function() {
        if (this.dao && this.dao.remove) {
          this.dao.remove(this.data);
          // our parent view should now destroy this view
          this.stack && this.stack.popView();
        }
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },
    function shouldDestroy(old,nu) { return (! old || ! nu) || old.model_.id !== nu.model_.id; },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-row">
          <div class="inline-edit-view-grow md-subhead">
            $$label{
              model_: 'foam.ui.md.TextFieldView',
              floatingLabel: false,
            }
          </div>
          %%dataTypePicker()
          <% this.toolbar.toHTML(out); %>
        </div>
        $$help{
          model_: 'foam.ui.md.TextFieldView',
          floatingLabel: false,
          growable: false,
          displayHeight: 1,
        }
        $$data{ model_: 'foam.apps.builder.model.ui.EditView',
                model: this.data.model_ }
      </div>
    */},
    function CSS() {/*
      .inline-edit-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
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
      .inline-edit-view .md-flex-row {
        overflow: hidden;
      }
      .inline-edit-view-grow {
        flex-grow: 1;
      }

    */},

  ]

});
