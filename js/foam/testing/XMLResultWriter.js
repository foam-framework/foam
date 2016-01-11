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
  package: 'foam.testing',
  name: 'XMLResultWriter',
  properties: [
    {
      type: 'String',
      name: 'name',
      defaultValue: 'FOAM Tests'
    },
    {
      name: 'tests'
    }
  ],
  methods: {
    toXML: function() {
      var failed = 0;
      var passed = 0;
      var errors = 0;
      for ( var i = 0; i < this.tests.length ; i++ ) {
        if ( this.tests[i].hasFailed() ) {
          failed++;
        } else {
          passed++;
        }
      }
      var run = failed + passed + errors;
      return this.outXML(undefined, passed, failed, errors, run).trim();
    }
  },
  templates: [
    function outXML(opt_out, passed, failed, errors, run) {/*<%
  var attr = XMLUtil.escapeAttr;
%><?xml version="1.0"?>
<testsuite name="<%= attr(this.name) %>" tests="<%= '' + run %>" failures="<%= '' + failed %>" errors="<%= '' + errors %>"><%
  for ( var i = 0 ; i < this.tests.length ; i++ ) {
    var test = this.tests[i];
%>
  <testcase name="<%= attr(test.name) %>" classname="<%= attr(test.modelId) %>" status="run"><%
    if ( test.hasFailed() ) { %><failure><% } else { %><system-out><![CDATA[<% }
    %><%= escapeHTML(test.results) %><%
    if ( test.hasFailed() ) { %></failure><% } else { %>]]></system-out><% }
    %>
  </testcase><%
  }
%></testsuite>*/}
  ]
});
