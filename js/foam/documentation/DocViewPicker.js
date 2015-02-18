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
  name: 'DocViewPicker',
  package: 'foam.documentation',
  extendsModel: 'foam.documentation.DocView',
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
              'foam.documentation.DocChaptersView'


  ],

  documentation: function() {/*
    Creates a sub-view appropriate for the specified data (such as a Model definition,
    DocumentationBook, or other thing.
  */},

  properties: [
    {
      name: 'data',
      documentation: function() {/*
        Handles a model change, which requires that the child views be torn down.
        If the data.model_ remains the same, the new data is simply propagated to
        the existing children.
      */},
      postSet: function(old, nu) {
        // destroy children
        this.destroy();
        // propagate data change (nowhere)
        this.model = nu.model_;
        this.childData = nu;
        // rebuild children with new data
        this.construct();

        this.onValueChange_(); // sub-classes may handle to change as well
      }
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
