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
  package: 'foam.tutorials.phonecat',
  name: 'Controller',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.tutorials.phonecat.dao.PhoneDAO',
    'foam.tutorials.phonecat.model.Phone',
    'foam.tutorials.phonecat.ui.PhoneCitationView',
    'foam.tutorials.phonecat.ui.PhoneDetailView',
    'foam.ui.ChoiceView',
    'foam.ui.DAOListView',
    'foam.ui.TextFieldView'
  ],

  properties: [
    {
      name: 'search',
      view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true },
    },
    {
      name: 'order',
      view: function() { return X.foam.ui.ChoiceView.create({
        choices: [
          [ X.foam.tutorials.phonecat.model.Phone.NAME, 'Alphabetical' ],
          [ X.foam.tutorials.phonecat.model.Phone.AGE,  'Newest' ]
        ]
      }); }
    },
    {
      name: 'dao',
      factory: function() {
        return this.PhoneDAO.create();
      }
    },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      view: {
        factory_: 'foam.ui.DAOListView',
        xxxfactory_: 'foam.ui.md.TableView',
        rowView: 'foam.tutorials.phonecat.ui.PhoneCitationView',
        mode: 'read-only'
      },
      dynamicValue: function() {
        return this.dao.orderBy(this.order).where(CONTAINS_IC(SEQ(this.Phone.NAME, this.Phone.SNIPPET), this.search));
      }
    }
  ],

  templates: [
    function CSS() {/*
      body {
        padding: 20px;
      }

      body {
        margin-top: 8px !important;
      }

      .phone-images {
        background-color: white;
        width: 450px;
        height: 450px;
        overflow: hidden;
        position: relative;
        float: left;
      }

      .phones {
        list-style: none;
      }

      .thumb {
        float: left;
        margin: -1em 1em 1.5em 0em;
        padding-bottom: 1em; height: 100px;
        width: 100px;
      }

      .phones li {
        clear: both;
        height: 100px;
        padding-top: 15px;
      }
    */},
    function toHTML() {/*
      <% window.document.head.insertAdjacentHTML('beforeend', '<base href="js/foam/tutorials/phonecat/">'); %>
      <% window.document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="css/bootstrap.css">'); %>
      <% if ( window.location.hash ) {
        var view = this.PhoneDetailView.create({model: this.Phone});
        this.addChild(view);

        this.dao.find(window.location.hash.substring(1), {put: function(phone) {
          view.data = phone;
        }});

        return view.toHTML();
      } else { %>
        &nbsp;&nbsp; Search: $$search
        &nbsp;&nbsp; Sort by: $$order
        <p>
        $$filteredDAO{className: 'phones', tagName: 'ul'}
      <% } %>
    */}
  ],
  methods: {
    init: function() {
      this.SUPER();
      // TODO: use MementoMgr instead
      window.addEventListener('hashchange', function() {
        this.children = [];
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});
