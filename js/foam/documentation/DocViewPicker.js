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

  templates: [
    function toInnerHTML() {/*
      <% this.destroy();
      if (this.data && this.model) { %>
        $$data{model_: 'foam.documentation.FullPageDocView', model: this.model }
  <%  } %>
    */}
  ]


});
