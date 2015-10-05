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
  package: 'com.google.watlobby',
  name: 'TopicApp',
  extendsModel: 'foam.browser.ui.BrowserView',

  requires: [
    'com.google.watlobby.Topic',
    'com.google.watlobby.TopicCitationView',
    'com.google.watlobby.TopicDetailView',
    'foam.browser.BrowserConfig',
    'foam.browser.ui.DAOController',
    'foam.core.dao.ChromeStorageDAO',
    'foam.dao.EasyDAO',
    'foam.mlang.CannedQuery',
    'foam.ui.TextFieldView',
    'foam.ui.Tooltip',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.DAOListView',
    'foam.ui.md.PopupView'
  ],

  imports: [ 'dao' ],

  templates: [
    function CSS() {/*
      body{ color: #555; }
      .md-text-field-label { color: #999; }
      .radioLabel, .toggle-text-indicator { font-size: 16px !important; }
      .toggle-label { color: #333; font-size: 17px; }
    */}
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          title: 'WAT Lobby Admin',
          model: this.Topic,
          dao: this.dao,
          detailView: 'com.google.watlobby.TopicDetailView',
          listView: {
            factory_: 'foam.ui.md.DAOListView',
            rowView: 'com.google.watlobby.TopicCitationView',
            minWidth: 450,
            preferredWidth: 600,
            maxWidth: 600
          },
          cannedQueryDAO: [
            this.CannedQuery.create({
              label: 'Everything',
              expression: TRUE
            }),
            this.CannedQuery.create({
              label: 'Enabled',
              expression: EQ(this.Topic.ENABLED, true)
            }),
            this.CannedQuery.create({
              label: 'Disabled',
              expression: EQ(this.Topic.ENABLED, false)
            })
          ]
        });
      }
    }
  ]
});
