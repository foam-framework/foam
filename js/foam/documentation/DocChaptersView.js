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
  name: 'DocChaptersView',
  extendsModel: 'foam.documentation.DocView',
  help: 'Displays the contents of the given Chapters.',

  methods: {
//     onValueChange_: function() {
//       this.updateHTML();
//     },
    viewModel: function() { /* The $$DOC{ref:'Model'} type of the $$DOC{ref:'.data'}. */
      return this.X.Model; // force detailview to fall back to view.createTemplateView()
    }
  },

  templates: [
    function toInnerHTML()    {/*
    <%    this.destroy();
          if (this.data) { %>
            <div class="memberList">$$data{ model_: 'foam.ui.DAOListView', rowView: 'foam.documentation.DocumentationBookSummaryDocView', model: this.X.Documentation, mode: 'read-only' }</div>
    <%    } %>
    */}
  ]
});
