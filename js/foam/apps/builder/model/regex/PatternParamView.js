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
  name: 'PatternParamView',
  package: 'foam.apps.builder.model.regex',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.TextFieldView',
  ],

  documentation: function() {/* Extracts the parameter from a regex model. */ },

  properties: [
    {
      name: 'className',
      defaultValue: 'regex-picker-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
    [ 'extraClassName', 'md-flex-row-baseline' ],
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% if ( this.data && this.data.model_.getFeature('parameter') ) { %>
          $$parameter
          $$error
        <% } %>
      </div>
    */},

  ]

});
