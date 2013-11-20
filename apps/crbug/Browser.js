/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var CIssueBrowser = Model.create({
  name: 'CIssueBrowser',

  properties: [
    {
      name: 'rowSelection',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name: 'window'
    },
    {
      name: 'baseURL',
      defaultValue: 'https://code.google.com/p/'
    },
    {
      name: 'projectName',
      defaultValue: 'chromium'
    },
    {
      name: 'IssueDAO',
      defaultValueFn: function() { return IssueDAO; }
    },
    {
      name: 'url',
      defaultValueFn: function() { return this.baseURL + this.projectName; }
    },
    {
      name: 'timer',
      valueFactory: function() { return Timer.create(); }
    },
    {
      name: 'view',
      valueFactory: function() { return createView(this.rowSelection); }
    },
    {
      name: 'countField',
      type: 'TextFieldView',
      valueFactory: function() {
        return TextFieldView.create({
          name: 'count',
          mode: 'read-only',
          displayWidth: 40
        });
      }
    },
    {
      name: 'syncManager',
      valueFactory: function() {
        return SyncManager.create({
          srcDAO: IssueNetworkDAO,
          dstDAO: IssueDAO,
          lastModified: new Date(2011,01,01),
          modifiedProperty: CIssue.UPDATED
        });
      }
    },
    {
      name: 'searchChoice',
      valueFactory: function() {
        return ChoiceView.create({
          helpText: 'Search within:',
          choices:[
            ["",                            "&nbsp;All issues"],
            ["-status=Closed,Fixed,Done",              "&nbsp;Open issues"], // Should this be just 'Closed'?
            ["owner=me -status=Closed",     "&nbsp;Open and owned by me"],
            ["-status=Closed reporter=me",  "&nbsp;Open and reported by me"],
            ["-status=Closed is:starred",   "&nbsp;Open and starred by me"],
            ["-status=Closed commentby:me", "&nbsp;Open and comment by me"],
            ["status=New",                  "&nbsp;New issues"],
            ["status=Fixed,Done",           "&nbsp;Issues to verify"]
          ]});
      }
    },
    {
      name: 'searchField',
      valueFactory: function() { return TextFieldView.create({ name: 'search', displayWidth: 60 }); }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'performQuery',
      code: function(evt) {
        this.search(AND(
          CIssueQueryParser.parseString(this.searchChoice.value.get()) || TRUE,
          CIssueQueryParser.parseString(this.searchField.value.get()) || TRUE
        ).partialEval());
      }
    },
    {
      model_: 'Method',
      name: 'layout',
      code: function() {
        var H         = window.innerHeight;
        this.view.$.style.height = (H-this.view.$.offsetTop-30) + 'px';
      }
    }

  ],

  methods: {
    /*
    init: function() {
      this.SUPER();
    },
    */

    initHTML: function() {
      window.addEventListener('resize', this.layout, false);

      // TODO: add these as part of the Template
      this.searchChoice.insertInElement('searchChoice');
      this.searchField.insertInElement('searchField');
      this.countField.insertInElement('countField');
      this.view.insertInElement('view');

      this.searchChoice.value.addListener(this.performQuery);
      this.searchField.value.addListener(this.performQuery);

      this.syncManager.propertyValue('isSyncing').addListener(function() {
        if ( this.syncManager.isSyncing ) {
          this.timer.step();
          this.timer.start();
        } else {
          this.timer.stop();
          this.view.view = this.view.view;
        }
      }.bind(this));

      this.rowSelection.addListener(function(_,_,_,issue) {
        document.location = 'https://code.google.com/p/chromium/issues/detail?id=' + issue.id;
      });

      var logo = $('logo');
      logo.onclick = this.syncManager.forceSync.bind(this.syncManager);

      var timer = this.timer;
      Events.dynamic(function() {
        logo.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
      });

      this.layout();
      this.search(TRUE);
    },

    /** Filter data with the supplied predicate, or select all data if null. **/
    search: function(p) {
      if ( p ) console.log('SEARCH: ', p.toSQL());
      this.view.dao = p ? this.IssueDAO.where(p) : this.IssueDAO;
      var self = this;
      apar(
        this.view.dao.select(COUNT()),
        this.IssueDAO.select(COUNT()))(function(x, y) {
          self.countField.value.value = x.count.toLocaleString() + ' of ' + y.count.toLocaleString() + ' selected';
        }
      );
    }
  },

  templates: [
    {
      name: "toHTML",
      description: "",
      template: "<html>\u000a <head>\u000a  <link rel=\"stylesheet\" type=\"text/css\" href=\"foam.css\" />\u000a  <link rel=\"stylesheet\" type=\"text/css\" href=\"../../core/foam.css\" />\u000a  <link rel=\"stylesheet\" type=\"text/css\" href=\"crbug.css\" />\u000a  <title>Chromium Issues</title>\u000a </head>\u000a <body><div id=\"header\">\u000a<table>\u000a  <tr>\u000a  <td>\u000a    <img id=\"logo\" src=\"images/logo.png\">\u000a  </td>\u000a  <td>\u000a    <span class=\"title\">cr<sup><font size=-0.5>2</font></sup>bug</span>\u000a    <div class=\"subtitle\">Chromium issue tracker in Chromium.</div>\u000a  </td>\u000a  <td width=150></td>\u000a  <td valign=\"bottom\">\u000a  <div class=\"searchBar\">\u000a  Search <span id=\"searchChoice\"></span> for <span id=\"searchField\"></span> <span id=\"countField\"></span>\u000a  <img id=settings src=\"images/settings.svg\"></div>\u000a  </td>\u000a  </tr>\u000a</table>\u000a<hr color=\"#9BC0FA\">\u000a</div><span id=\"view\"></span></body>\u000a</html>"
    }
  ]
});