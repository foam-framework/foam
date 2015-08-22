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
  name: 'MetaDescriptorView',
  package: 'foam.meta.descriptor',

  requires: [
    'foam.ui.md.PopupChoiceView',
  ],

  extendsModel: 'foam.meta.types.EditView',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-meta-descriptor-view',
    },
  ],

  // actions: [
  //   {
  //     name: 'createButton',
  //     iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
  //     //isAvailable: function() { return this.data.showAdd; },
  //     code: function() {
  //       this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceListView');
  //       var edit = this.UpdateDetailView.create({
  //         data: this.PropertyMetaDescriptor.create(),
  //         exitOnSave: true,
  //         innerView: 'foam.meta.descriptor.MetaDescriptorView',
  //       });
  //       this.stack.pushView(edit);
  //     }
  //   },
  // ],
  //
  // listeners: [
  //   {
  //     name: 'subObjectChange',
  //     code: function() {
  //       this.data.propertyChange('properties', null, this.data.properties);
  //     }
  //   },
  // ],
  //
  // methods: [
  //   function put(o, sink) {
  //     var prop = o.model.create({ name: o.name });
  //     this.data.properties.put(prop);
  //     prop.addListener(this.subObjectChange);
  //     this.subObjectChange();
  //
  //     sink && sink.put(prop);
  //   },
  // ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="meta-edit-heading md-style-trait-standard">
          $$metaEditPropertyTitle{ model_: foam.ui.TextFieldView, mode:'read-only' }
        </div>
        $$name
        $$model
      </div>
    */},
    function CSS() {/*
      .md-meta-descriptor-view {
        flex-grow: 1;
        padding: 10px;
      }
    */}
  ]

});

