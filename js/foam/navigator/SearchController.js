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
    'foam.navigator.BrowserConfig',
    'foam.navigator.IssueConfig',
    'foam.navigator.dao.MultiDAO',
    'foam.navigator.types.Issue',
    'foam.navigator.types.Mail',
    'foam.navigator.dao.FOAMletDecoratorDAO',
    'foam.navigator.types.Todo',
    'CachingDAO',
    'IDBDAO',
    'FOAMGMailMessage',
    'EMail',
    'MDAO',
    'GMailToEMailDAO'
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
            model: 'foam.navigator.types.Mail',
            dao: this.CachingDAO.create({
              src: this.FOAMletDecoratorDAO.create({
                model: this.Mail,
                delegate: this.GMailToEMailDAO.create({
                  delegate: this.IDBDAO.create({
                    model: this.FOAMGMailMessage, useSimpleSerialization: false
                  })
                }),
              }),
              delegate: this.MDAO.create({ model: this.Mail })
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
    }
  ],
  listeners: [
    {
      name: 'doQuery',
      code: function() {
        this.filteredDao = this.dao.where(MQL(this.query)).limit(10);
      }
    }
  ],
  templates: [
    function CSS() {/*
      .searchBox {
        width: 523px;
        font: 16px arial,sans-serif;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" style="padding-top: 120px;">
        <center>
          <div style="background: url('<%= this.logo %>') no-repeat; background-size: 269px 95px; height: 95px; width:269px; padding-bottom: 20px"></div>
          <div>$$query{ onKeyMode: true, extraClassName: 'searchBox' }</div>
          <div>$$filteredDao</div>
        </center>
      </div> */}
  ]
});
 
