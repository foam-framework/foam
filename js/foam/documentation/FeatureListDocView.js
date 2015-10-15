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
  name: 'FeatureListDocView',
  documentation: 'Displays the HTML documentation of the given feature list.',

  extends: 'foam.ui.View',
  traits: ['foam.documentation.FeatureListLoaderTrait'],

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
    <%    this.destroy();
          if (!this.hasFeatures && !this.hasInheritedFeatures) { %>
          <% //  <p class="feature-type-heading">No <%=this.model.plural%>.</p> %>
    <%    } else {
            if (this.hasFeatures) {  %>
              <p class="feature-type-heading"><%=this.model.plural%>:</p>
              <div class="memberList">$$selfFeaturesDAO{ model_: 'foam.ui.DAOListView', rowView: 'foam.documentation.RowDocView', model: this.model , mode: 'read-only'}</div>
      <%    }
            if (this.hasInheritedFeatures) { %>
              <p class="feature-type-heading">Inherited <%=this.model.plural%>:</p>
      <%
              var fullView = this.DAOListView.create({ data$: this.inheritedFeaturesDAO$, rowView: 'foam.documentation.RowDocView', model: this.model, mode: 'read-only' });
              var collapsedView = this.DocFeatureCollapsedView.create({data$: this.inheritedFeaturesDAO$});
              %>
              <div class="memberList inherited">$$inheritedFeaturesDAO{ model_: 'foam.ui.CollapsibleView', collapsedView: collapsedView, fullView: fullView, showActions: true }</div>
      <%    } %>
    <%    } %>
    */}
  ],

});
