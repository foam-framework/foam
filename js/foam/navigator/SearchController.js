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
  name: 'SearchController',
  package: 'foam.navigator',
  extends: 'foam.ui.View',
  requires: [
    'foam.dao.CachingDAO',
    'foam.dao.IDBDAO',
    'MDAO',
    'Phone',
    'com.google.mail.EMailDAO',
    'com.google.mail.FOAMGMailMessage',
    'foam.core.dao.VersionNoDAO',
    'foam.lib.contacts.Address',
    'foam.lib.contacts.Contact',
    'foam.lib.contacts.PhoneNumber',
    'foam.lib.email.EMail',
    'foam.navigator.BrowserConfig',
    'foam.navigator.FOAMlet',
    'foam.navigator.IssueConfig',
    'foam.navigator.dao.MultiDAO',
    'foam.navigator.types.Audio',
    'foam.navigator.types.Issue',
    'foam.navigator.types.Mail',
    'foam.navigator.types.Todo',
    'foam.navigator.views.AudioGSnippet',
    'foam.navigator.views.ContactGSnippet',
    'foam.navigator.views.EMailGSnippet',
    'foam.navigator.views.GSnippet',
    'foam.navigator.views.IssueGSnippet',
    'foam.navigator.views.PhoneGSnippet',
    'foam.navigator.views.TodoGSnippet'
  ],
  imports: [
    'window'
  ],
  properties: [
    {
      name: 'configDao',
      factory: function() {
        var self = this;

        return [
          this.BrowserConfig.create({
            model: 'foam.navigator.types.Todo',
            dao: this.CachingDAO.create({
              src: this.IDBDAO.create({
                model: this.Todo,
                useSimpleSerialization: false
              }),
              delegate: this.MDAO.create({ model: this.Audio })
            })
          }),
          this.BrowserConfig.create({
            model: 'foam.navigator.types.Audio',
            dao: this.CachingDAO.create({
              src: this.IDBDAO.create({
                model: this.Audio,
                useSimpleSerialization: false
              }),
              delegate: this.MDAO.create({ model: this.Audio })
            })
          }),
          this.IssueConfig.create(),
          this.BrowserConfig.create({
            model: 'foam.lib.email.EMail',
            dao: this.EMailDAO.create({ withSync: false })
          }),
          this.BrowserConfig.create({
            model: this.Contact,
            dao: this.CachingDAO.create({
              src: this.IDBDAO.create({
                model: this.Contact,
                useSimpleSerialization: false
              }),
              delegate: this.MDAO.create({ model: this.Contact })
            })
          }),
          this.BrowserConfig.create({
            model: this.Phone,
            dao: phones
          })
        ].dao;
      },
      postSet: function(_, value) {
        for ( var i = 0; i < value.length; i++ ) {
          var config = value[i];
          this.X[config.model.name + 'DAO'] = config.dao;
        }
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.MultiDAO.create({ configDAO: this.configDao });
      }
    },
    {
      name: 'logo',
      defaultValue: 'https://www.google.ca/images/srpr/logo11w.png',
      view: 'foam.ui.ImageView'
    },
    {
      type: 'String',
      name: 'query',
      postSet: function(old, nu) { if (nu) this.expanded = true; }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDao',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.navigator.views.GSnippet'
      }
    },
    {
      type: 'Boolean',
      name: 'expanded',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( old != nu ) this.updateHTML();
      }
    },
    {
      name: 'modelNames',
      factory: function() {
        return [
          'All',
          'EMail',
          'Todo',
          'Audio',
          'Contacts'
        ].sink;
      }
    },
    {
      name: 'modelFilter',
      defaultValue: 'All',
      view: { factory_: 'ChoiceListView', extraClassName: 'model-names' }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      Events.dynamicFn(
        function() { this.dao; this.query; this.modelFilter }.bind(this),
        function() {
          var modelQuery = this.modelFilter === 'All' ? TRUE :
              EQ(this.FOAMlet.TYPE, this.modelFilter);
          this.filteredDao = this.dao &&
              this.dao.where(AND(modelQuery, MQL(this.query))).limit(10);
        }.bind(this));
      this.maybeLoadData('Todo', 'Audio');
    },
    updateHTML: function() {
      if ( ! this.$ ) return;
      this.$.outerHTML = this.toHTML();
      this.initHTML();
    },
    initHTML: function() {
      this.SUPER();
      // TODO: Hack, should views should have a focus() method?
      this.queryView.$.focus();
    },
    toHTML: function() {
      return this.expanded ? this.expandedHTML() : this.collapsedHTML();
    },
    maybeLoadData: function() {
      var args = argsToArray(arguments);
      args.forEach(function(modelName) {
        this.dao.where(EQ(this.FOAMlet.TYPE, modelName)).select(COUNT())(
            function(res) {
              if ( res.count <= 0 && this.window[modelName + 'Data']) {
                console.log('Adding canned data for ' + modelName);
                this.window[modelName + 'Data'].forEach(function(item) {
                  console.log('Putting', item, 'for', modelName);
                  this.dao.put(item);
                }.bind(this));
              }
            }.bind(this));
      }.bind(this));
    }
  },
  templates: [
    function CSS() {/*
      .searchBox {
        width: 523px;
        font: 16px arial,sans-serif;
        flex-grow: 0;
        flex-string: 0;
      }
      body {
        margin: 0;
        padding: 0;
        border: 0;
      }

      .search-results {
        padding: 20px 80px;
      }
      .filters {
        border-bottom: 1px solid #ccc;
        padding-left: 70px;
        width: 100%;
      }
      .model-names .choice {
        margin: 0;
        padding: 0 12px 10px;
        cursor: pointer;
      }
      .model-names .choice.selected {
        border-bottom: 3px solid #dd4b39;
        color: #dd4b39;
      }
    */},
    function expandedHTML() {/*
      <div id="<%= this.id %>">
        <div style="background: #f1f1f1; height: 60px; display: flex; display: -webkit-flex; align-items: center; -webkit-align-items: center">
          <div style="display: inline-block; flex-grow: 0; -webkit-flex-grow: 0; flex-shrink: 0; -webkit-flex-shrink: 0; padding-right: 12px; margin-left: 12px; background: url('<%= this.logo %>') no-repeat; background-size: 92px 33px; height: 33px; width: 92px"></div>
          $$query{ onKeyMode: true, extraClassName: 'searchBox' }
        </div>
        <div class="filters">$$modelFilter{ choices: this.modelNames }</div>
        <div class="search-results">$$filteredDao</div>
      </div>
    */},
    function collapsedHTML() {/*
      <div id="<%= this.id %>" style="padding-top: 120px">
        <center>
          <div style="background: url('<%= this.logo %>') no-repeat; background-size: 269px 95px; height: 95px; width:269px; padding-bottom: 20px"></div>
          <div>$$query{ onKeyMode: true, extraClassName: 'searchBox' }</div>
          <div>$$filteredDao</div>
        </center>
      </div> */}
  ]
});
