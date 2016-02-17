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
  package: 'foam.ui.md',
  name: 'CitationView',
  extends: 'foam.ui.md.DetailView',

  properties: [
    {
      name: 'model',
      defaultValueFn: function() {
        return this.data.model_;
      }
    },
    {
      name: 'className',
      defaultValue: 'md-citation-view'
    }
  ],

  methods: [
    function pickNameProperty() {
      var prop = this.model.getFeature('label') || this.model.getFeature('name');
      if (!prop) {
        var props = this.model.getRuntimeProperties();
        var stringProps = [];
        for (var i = 0; i < props.length; i++) {
          var p = props[i];
          if (! p.hidden && p.name !== 'id' && p.model_.id === 'Property' || p.model_.id === 'StringProperty') {
            stringProps.push(p);
          }
        }
        for (var i = 0; i < stringProps.length; i++) {
          var p = stringProps[i];
          var pname = p.name.toLowerCase();
          if (pname.indexOf('name') > -1 || pname.indexOf('label') > -1) {
            prop = p;
            break;
          }
        }
        if (!prop && stringProps.length) prop = stringProps[0];
      }
      if (!prop) prop = this.model.getFeature('id');
      return prop;
    }
  ],

  templates: [
    function CSS() {/*
      .md-citation-view {
        align-items: center;
        border-bottom: 1px solid #eee;
        display: flex;
        min-height: 48px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <%= this.createTemplateView(this.pickNameProperty().name, { mode: 'read-only', floatingLabel: false }) %>
      </div>
    */}
  ]
});
