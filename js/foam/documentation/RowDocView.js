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
  name: 'RowDocView',
  extends: 'foam.documentation.DocView',
  label: 'Documentation View Row',

  documentation: function() {/*
    For one or two line row views, only including essential information,
    subclass $$DOC{ref:'foam.documentation.RowDocView'}.</p>
    <p>Name your subclass with the name of the type you support:</p>
    <p><code>
    CLASS({ <br/>
    &nbsp;&nbsp;  name: 'ListenerRowDocView',<br/>
    &nbsp;&nbsp;  extends: 'RowDocView'<br/>
    });<br/>
    // automatically creates ListenerRowDocView<br/>
    RowDocView.create({model:X.Listener});<br/>
    </code></p>
  */},

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        <p class="important"><%=this.data.name%></p>
        $$documentation{ model_: 'foam.documentation.DocBodyView' }
<%    } %>
    */}
  ]


});
