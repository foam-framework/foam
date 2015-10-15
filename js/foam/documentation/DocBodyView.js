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
  name: 'DocBodyView',
  extends: 'foam.documentation.DocView',
  label: 'Documentation Body View Base',
  documentation: 'Base Model for documentation body-text views.',

  imports: ['documentViewRef'],

  properties: [
    {
      name: 'data',
      documentation: 'The documentation to display.',
      required: true,
      postSet: function() {
        if (this.data && this.data.body) {
          this.renderDocSourceHTML = TemplateUtil.lazyCompile(this.data.body);
        }

        if (this.data && (!this.model || this.model !== this.data.model_)) {
          this.model = this.data.model_;
        }
        this.childData = this.data;
        this.updateHTML();
      }
    },
  ],
  methods: {
    renderDocSourceHTML: function() {
      // only update if we have all required data
      if (this.data.body && this.documentViewRef
          && this.documentViewRef.get().valid) {
        // The first time this method is hit, replace it with the one that will
        // compile the template, then call that. Future calls go direct to lazyCompile's
        // returned function. You could also implement this the same way lazyCompile does...
        return this.renderDocSourceHTML();
      } else {
        console.warn("Rendered ", this, " with no data!");
        return ""; // no data yet
      }
    }
  },

  templates: [
    function toInnerHTML() {/*
      <%    this.destroy(); %>
      <%    if (this.data) {  %>
              <p><%=this.renderDocSourceHTML()%></p>
      <%    } %>
    */}
  ]
});
