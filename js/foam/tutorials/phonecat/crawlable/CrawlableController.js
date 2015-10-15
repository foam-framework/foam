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
  package: 'foam.tutorials.phonecat.crawlable',
  name: 'CrawlableController',
  extends: 'foam.ui.View',
  requires: [
    'foam.tutorials.phonecat.crawlable.CrawlableDetailView',
    'foam.tutorials.phonecat.crawlable.CrawlableRowView',
    'foam.ui.DAOListView'
  ],
  exports: [ 'applicationURL', 'applicationIdURL' ],
  properties: [
    {
      name: 'applicationURL'
    },
    {
      name: 'applicationIdURL'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.tutorials.phonecat.crawlable.CrawlableRowView'
      }
    }
  ],
  templates: [
    function toHTML() {/*
      <% if ( window.location.hash ) {
        var view = this.CrawlableDetailView.create();
        this.addChild(view);

        var id = window.location.hash.substring(1);
        this.dao.find(id, {put: function(obj) {
          view.data = obj;
        }});

//        window.setTimeout(
//          function() { window.location = self.applicationIdURL + id; },
//          1000);

        return view.toHTML();
      } else { %>
        $$dao
        <%
//        window.setTimeout(
//          function() { window.location = self.applicationURL; },
//          1000);
        %>
      <% } %>
    */}
 ],
  methods: {
    init: function() {
      this.SUPER();
      window.addEventListener('hashchange', function() {
        this.children = [];
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});
