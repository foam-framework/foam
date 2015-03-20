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
  name: 'Controller',

  requires: [
    'PhoneCitationView', 
    'PhoneDetailView',
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
      defaultValue: Phone.NAME,
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          [ Phone.NAME, 'Alphabetical' ],
          [ Phone.AGE,  'Newest' ]
        ]
      }
    },
    { name: 'dao', defaultValue: phones },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      model_: 'DAOProperty',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'PhoneCitationView',
        mode: 'read-only'
      },
      dynamicValue: function() {
        return this.dao.orderBy(this.order).where(CONTAINS_IC(SEQ(Phone.NAME, Phone.SNIPPET), this.search));
      }
    }
  ]
});


CLASS({ name: 'PhoneCitationView', extendsModel: 'foam.ui.DetailView', templates: [
  function toHTML() {/*
      <li class="thumbnail">
        <a href="#{{this.data.id}}" class="thumb">$$imageUrl</a>
        <a href="#{{this.data.id}}">$$name{mode: 'read-only'}</a>
        <p>$$snippet{mode: 'read-only'}</p>
      </li>
  */}
]});


CLASS({
  name: 'PhoneDetailView',
  requires: [ 'foam.ui.animated.ImageView' ],
  extendsModel: 'foam.ui.DetailView',
  templates: [ { name: 'toHTML' } ]
});


CLASS({
  name: 'ControllerView',
  extendsModel: 'foam.ui.DetailView',
  templates: [
    function toHTML() {/*
      <% if ( window.location.hash ) {
        var view = PhoneDetailView.create({model: Phone});
        this.addChild(view);

        this.data.dao.find(window.location.hash.substring(1), {put: function(phone) {
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
