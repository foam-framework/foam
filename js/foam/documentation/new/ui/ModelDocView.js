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
  name: 'ModelDocView',
  package: 'foam.documentation.new.ui',
  extends: 'foam.ui.View',
  requires: [
    'foam.documentation.new.ui.PropertyDocView',
    'foam.documentation.new.ui.MethodDocView',
    /*
    'foam.documentation.new.ui.ListenerDocView',
    'foam.documentation.new.ui.ActionDocView',
    'foam.documentation.new.ui.TemplateDocView',
    'foam.documentation.new.ui.RelationshipDocView',
    */
  ],

  imports: [
    'documentViewRef',
  ],

  properties: [
    {
      name: 'data',
      documentation: 'The documentation object returned from the ' +
          'InheritanceEngine.',
    },
    {
      type: 'ViewFactory',
      name: 'docView',
      factory: function() {
        var typeMap = {
          properties: this.PropertyDocView,
          methods: this.MethodDocView,
        };
        var Y = this.Y;
        return function(args, opt_X) {
          var type = args.data.type;
          return typeMap[type].create(args, opt_X || Y);
        };
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="<%= this.id %>" class="doc-model">
        <div class="doc-header">
          <div class="doc-header-name">
            <%= this.data.model_.name %>
          </div>
          <div class="doc-header-package">
            <%= this.data.model_.package %>
          </div>
          </div>
        </div>
        <% this.featureBlockHTML(out, 'properties'); %>
        <% this.featureBlockHTML(out, 'methods'); %>
      </div>
    */},
    function featureBlockHTML() {/*
      <% var type = arguments[1]; %>
      <div class="doc-section">
        <h3><%= capitalize(type) %></h3>
        <%
          var map = this.data[type];
          var keys = Object.keys(map);
          for(var i = 0; i < keys.length; i++) {
            var view = this.docView({ data: map[keys[i]] });
            out(view.toHTML());
            view.initHTML();
          }
        %>
      </div>
  */},
  ],
});
