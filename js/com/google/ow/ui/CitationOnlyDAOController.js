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
  package: 'com.google.ow.ui',
  name: 'CitationOnlyDAOController',
  extends: 'foam.browser.ui.DAOController',
  documentation: "A DAOController with no header.",
  properties: [
    ['mode', 'read-write'],
    ['editView', function(args, X) {
      var Y = X || this.Y;
      var v = this.UpdateDetailView.create(args,Y);
      v.liveEdit = true;
      v.title = ((args.data && args.data.data) || args.data || Y.data).titleText;
      return v;
    }]
  ],

  templates: [
    function CSS() {/*
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="dao-controller-body">
          <%
            var list = this.DAOListView.create({
              data: this.data,
              rowView: this.rowView
            }, this.Y);
            out(list);
            list.subscribe(list.ROW_CLICK, this.onRowClick);
          %>
        </div>
      </div>
    */},
  ]
});
