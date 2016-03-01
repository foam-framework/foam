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
  package: 'foam.documentation',
  name: 'DocViewPicker',
  extends: 'foam.documentation.DocView',
  label: 'Documentation View Full Page',
  documentation: 'Base Model for full page documentation views.',

  requires:  ['foam.documentation.FullPageDocView',
              'foam.documentation.ModelFullPageDocView',
              'foam.documentation.InterfaceFullPageDocView',
              'foam.documentation.DocumentationBookFullPageDocView',

              'foam.documentation.PropertyRowDocView',
              'foam.documentation.MethodRowDocView',
              'foam.documentation.ActionRowDocView',
              'foam.documentation.RelationshipRowDocView',
              'foam.documentation.IssueRowDocView',
              'foam.documentation.TemplateRowDocView',
              'foam.documentation.ModelRowDocView',

              'foam.documentation.MethodSimpleRowDocView',

              'foam.documentation.ModelSummaryDocView',
              'foam.documentation.InterfaceSummaryDocView',
              'foam.documentation.DocumentationBookSummaryDocView',
              'foam.documentation.DocChaptersView',

              'foam.documentation.SubModelOptionalView',
              'foam.documentation.TraitUsersOptionalView'


  ],

  documentation: function() {/*
    Creates a sub-view appropriate for the specified data (such as a Model definition,
    DocumentationBook, or other thing.
  */},

  methods: [
    function init() {
      this.SUPER();

      // Hack to make model-for-model work, since the target package is the root
      // (Model, Properties, etc, have no package)
      GLOBAL.registerModel(this.FullPageDocView, "FullPageDocView");
      GLOBAL.registerModel(this.ModelFullPageDocView, "ModelFullPageDocView");
      GLOBAL.registerModel(this.InterfaceFullPageDocView, "InterfaceFullPageDocView");
      GLOBAL.registerModel(this.DocumentationBookFullPageDocView, "DocumentationBookFullPageDocView");
      
      GLOBAL.registerModel(this.PropertyRowDocView, "PropertyRowDocView");
      GLOBAL.registerModel(this.MethodRowDocView, "MethodRowDocView");
      GLOBAL.registerModel(this.ActionRowDocView, "ActionRowDocView");
      GLOBAL.registerModel(this.RelationshipRowDocView, "RelationshipRowDocView");
      GLOBAL.registerModel(this.IssueRowDocView, "IssueRowDocView");
      GLOBAL.registerModel(this.TemplateRowDocView, "TemplateRowDocView");
      GLOBAL.registerModel(this.ModelRowDocView, "ModelRowDocView");

      GLOBAL.registerModel(this.MethodSimpleRowDocView, "MethodSimpleRowDocView");

      GLOBAL.registerModel(this.ModelSummaryDocView, "ModelSummaryDocView");
      GLOBAL.registerModel(this.InterfaceSummaryDocView, "InterfaceSummaryDocView");
      GLOBAL.registerModel(this.DocumentationBookSummaryDocView, "DocumentationBookSummaryDocView");
      GLOBAL.registerModel(this.DocChaptersView, "DocChaptersView");

      GLOBAL.registerModel(this.SubModelOptionalView, "SubModelOptionalView");
      GLOBAL.registerModel(this.TraitUsersOptionalView, "TraitUsersOptionalView");
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% this.destroy();
      if (this.data && this.model) { %>
        $$data{model_: 'foam.documentation.FullPageDocView', model: this.model }
  <%  } %>
    */}
  ]


});
