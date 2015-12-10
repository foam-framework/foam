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
  name: 'TypePickerView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.PopupChoiceView',
  ],

  documentation: function() {/*
    Base view to display a value that can be replaced with a value of
    another type, along with an inner view that can change when the
    type changes.
  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'type-picker-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
    {
      type: 'ViewFactory',
      name: 'innerView',
      help: 'The view factory to produce the inner view.',
      lazyFactory: function() {
        return function(args, X) {
          var Y = X || this.Y;
          return Y.lookup('foam.ui.md.DetailView').create(args, Y);
        };
      }
    },
    {
      type: 'Array',
      name: 'typeList',
      subType: 'Model',
      help: 'The list of Model instances to pick from.',
    },
    {
      type: 'ViewFactory',
      name: 'dataTypePicker',
      defaultValue: function(args, X) {
        return this.PopupChoiceView.create({
          data$: this.dataType$,
          dao: this.typeList,
          objToChoice: function(obj) {
            return [obj.id, obj.label];
          },
          autoSetData: false,
        }, X || this.Y);
      }
    },
    {
      name: 'dataType',
      help: 'The model ID of the current or new data type',
      postSet: function(old, nu) {
        if ( old && nu && ( ! this.data || ( nu !== this.data.model_.id )) ) {
          // new type set, reconstruct, copying properties where possible
          this.data = this.X.lookup(nu).create((this.data || {}), this.Y);
          this.updateHTML();
        }
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        this.dataType = nu ? nu.model_.id : '';
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-row-end">
          <div class="md-picker-view-dropdown">
            %%dataTypePicker()
          </div>
          %%innerView()
        </div>
      </div>
    */},
    function CSS() {/*
      .md-picker-view-dropdown {
        min-width: 220px;
      }
    */},
  ]

});
