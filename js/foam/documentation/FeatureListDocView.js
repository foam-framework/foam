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
  name: 'FeatureListDocView',
  package: 'foam.documentation',
  documentation: 'Displays the HTML documentation of the given feature list.',

  extendsModel: 'foam.ui.DestructiveDataView',
  traits: ['foam.ui.HTMLViewTrait',
           'foam.ui.ViewActionsTrait',
           'foam.ui.TemplateSupportTrait',
           'foam.documentation.FeatureListLoaderTrait'],
           
  requires: [ 'foam.ui.DAOListView',
              'foam.ui.CollapsibleView',
              'foam.documentation.DocFeatureCollapsedView'],

  properties: [
    {
      name: 'tagName',
      defaultValue: 'div'
    }
  ],

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy(); console.log("featurelist hasFeatures: ", this.hasFeatures);
          if (!this.hasFeatures && !this.hasInheritedFeatures) { %>
          <% //  <p class="feature-type-heading">No <%=this.model.plural%>.</p> %>
    <%    } else {
            if (this.hasFeatures) {  %>
              <p class="feature-type-heading"><%=this.model.plural%>:</p>
              <div class="memberList">$$selfFeaturesDAO{ model_: 'foam.ui.DAOListView', rowView: 'foam.documentation.RowDocView', model: this.model }</div>
      <%    }
            if (this.hasInheritedFeatures) { %>
              <p class="feature-type-heading">Inherited <%=this.model.plural%>:</p>
      <%
              var fullView = this.DAOListView.create({ data$: this.inheritedFeaturesDAO$, rowView: 'foam.documentation.RowDocView', model: this.model });
              var collapsedView = this.DocFeatureCollapsedView.create({data$: this.inheritedFeaturesDAO$});
              %>
              <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'foam.ui.CollapsibleView', collapsedView: collapsedView, fullView: fullView, showActions: true }</div>
      <%    } %>
    <%    } %>
    */}
  ],

});
