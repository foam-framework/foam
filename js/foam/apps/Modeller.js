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
  name: 'Modeller',
  package: 'foam.apps',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.ui.StackView',
    'foam.core.dao.StorageDAO',
    'Model',
    'foam.ui.layout.DOMPanel'
  ],

  exports: [
    'stack'
  ],

  properties: [
    {
      name: 'models_',
      factory: function() {
        return [
          Action,
          AlternateView,
          Circle,
          DAOController,
          DAOCreateController,
          DAOUpdateController,
          Graph,
          Issue,
          Mouse,
          Rectangle,
          StackView,
          TextAreaView,
          Template,
          Timer,
          UnitTest
        ];
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.StorageDAO.create({ model: this.Model });
      },
      postSet: function(_, dao) {
        dao.select(COUNT())(function(c) {
          if ( c.count == 0 ) {
            console.log("Populating DAO");
            this.models_.select(dao);
          }
        }.bind(this))
      }
    },
    {
      name: 'stack',
      factory: function() { return this.StackView.create(); }
    },
    {
      name: 'panel',
      factory: function() {
        return this.DOMPanel.create({
          data: this.stack,
          extraClassName: 'panel'
        });
      }
    }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.stack.layout();
      FOAM.browse(Model, this.dao, this.X);
    }
  },
  templates: [
    function CSS() {/*
      .bar {
         color: white;
         margin-left:8px;
         font-family: Arial, sans-serif;
         font-size: 14px;
         font-style: normal;
         font-variant: normal;
         font-weight: normal;
      }
      .panel {
        flex: 1 1 auto;
      }
      body {
        display:flex;
        flex-direction: column;
      }
    */},
    function toHTML() {/*
      <div style="height:40px;background:whitesmoke;border-width: 0 0 1px;border: 0 solid #e5e5e5;flex: 0 0 auto;-webkit-flex: 0 0 auto">
        <font size=+3 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">
        <font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>
        <font color="#555555" >Modeller</font></font>
        </div>
        <a href="/core/issue.html">Issues</a>
        <br/>
        <br/>
        <div style="display: flex;display: -webkit-flex;flex: 1 1 auto;-webkit-flex: 1 1 auto"><%= this.panel %></div>
      </div>
    */}
  ]
});
