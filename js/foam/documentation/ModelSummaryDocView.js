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
  name: 'ModelSummaryDocView',
  extends: 'foam.documentation.DocView',

  imports: ['subModelDAO', 'traitUserDAO'],

  documentation: "A summary documentation view for $$DOC{ref:'Model'} instances.",

  requires: ['foam.documentation.diagram.DocDiagramView',
             'foam.documentation.TextualDAOListView',
             'foam.documentation.DocFeatureModelRefView',
             'foam.documentation.DocBodyView'],

  properties: [
    'subModelDAO',
    'traitUserDAO',
    {
      name: 'data',
      postSet: function(old, nu) {
        this.updateHTML();
      }
    },
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <div class="introduction">
          <div class="diagram">
            $$data{ model_: 'foam.documentation.diagram.DocDiagramView' }
          </div>
          <h1><%=this.data.name%></h1>
          <div class="model-info-block">
<%        if (this.data.model_ && this.data.model_.id && this.data.model_.id != "Model") { %>
            <p class="important">Implements $$DOC{ref: this.data.model_.id }</p>
<%        } else { %>
            <p class="important">$$DOC{ref:'Model'} definition</p>
<%        } %>
<%        if (this.data.sourcePath) { %>
            <p class="note">Loaded from <a href='<%=this.data.sourcePath%>'><%=this.data.sourcePath%></a></p>
<%        } else { %>
            <p class="note">No source path available.</p>
<%        } %>
<%        if (this.data.package) { %>
            <p class="important">Package <%=this.data.package%></p>
<%        } %>
<%        if (this.data.extends) { %>
            <p class="important">Extends $$DOC{ref: this.data.extends }</p>
<%        } %>
<%        if (this.data.traits && this.data.traits.length > 0) { %>
            <p class="important">Traits: $$traits{ model_: 'foam.documentation.TextualDAOListView', rowView: 'foam.documentation.DocFeatureModelRefView', mode: 'read-only' }</p>
<%        } %>
          $$subModelDAO{ model_: 'foam.documentation.SubModelOptionalView' }
          $$traitUserDAO{ model_: 'foam.documentation.TraitUsersOptionalView' }
          </div>
          $$documentation{ model_: 'foam.documentation.DocBodyView' }
          <div class="clear">&nbsp;</div>
        </div>
<%    } %>
    */}
  ]
});
