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
  extendsModel: 'View',
  requires: [
    'foam.navigator.views.GSnippet',
    'foam.navigator.views.EMailGSnippet',
    'foam.navigator.views.ContactGSnippet',
    'foam.navigator.views.IssueGSnippet',
    'foam.navigator.BrowserConfig',
    'foam.navigator.IssueConfig',
    'foam.navigator.dao.MultiDAO',
    'foam.navigator.types.Issue',
    'foam.navigator.types.Mail',
    'foam.navigator.types.Todo',
    'CachingDAO',
    'IDBDAO',
    'FOAMGMailMessage',
    'EMail',
    'MDAO',
    'GMailToEMailDAO',
    'lib.contacts.Contact'
  ],
  properties: [
    {
      name: 'configDao',
      factory: function() {
        var self = this;

        return [
          this.BrowserConfig.create({ model: 'foam.navigator.types.Todo' }),
          this.IssueConfig.create(),
          this.BrowserConfig.create({
            model: 'EMail',
            dao: this.CachingDAO.create({
              src: this.GMailToEMailDAO.create({
                delegate: this.IDBDAO.create({
                  model: this.FOAMGMailMessage, useSimpleSerialization: false
                })
              }),
              delegate: this.MDAO.create({ model: this.EMail })
            })
          }),
          this.BrowserConfig.create({
            model: this.Contact,
            dao: this.IDBDAO.create({
              model: this.Contact,
              useSimpleSerialization: false
            })
          })
        ].dao;
      }
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      factory: function() {
        return this.MultiDAO.create({ configDAO: this.configDao });
      }
    },
    {
      name: 'logo',
      defaultValue: 'https://www.google.ca/images/srpr/logo11w.png',
      view: 'ImageView'
    },
    {
      model_: 'StringProperty',
      name: 'query',
      postSet: function() { this.doQuery(); }
    },
    {
      model_: 'DAOProperty',
      name: 'filteredDao',
      view: {
        factory_: 'DAOListView',
        rowView: 'foam.navigator.views.GSnippet'
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'expanded',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( old != nu ) this.updateHTML();
      }
    }
  ],
  listeners: [
    {
      name: 'doQuery',
      code: function() {
        this.expanded = true;
        this.filteredDao = this.dao.where(MQL(this.query)).limit(10);
      }
    }
  ],
  methods: {
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
    */},
    function expandedHTML() {/*
      <div id="<%= this.id %>">
        <div style="background: #f1f1f1; height: 60px; display:flex; align-items: center;">
          <div style="display: inline-block; flex-grow: 0; flex-shrink: 0; padding-right: 12px; margin-left: 12px; background: url('<%= this.logo %>') no-repeat; background-size: 92px 33px; height: 33px; width: 92px"></div>
          $$query{ onKeyMode: true, extraClassName: 'searchBox' }
        </div>
        <div style="padding-top: 20px;">$$filteredDao</div>
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
 
