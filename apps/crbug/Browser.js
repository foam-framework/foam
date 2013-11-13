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

var IssueBrowser = Model.create({
  name: 'IssueBrowser',

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
      name: 'syncManager',
      valueFactory: function() {
        return SyncManager.create({
          srcDAO: IssueNetworkDAO,
          dstDAO: IssueDAO,
          lastModified: new Date(2013,01,01),
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
            ["-status=Closed",              "&nbsp;Open issues"],
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
      valueFactory: function() { return TextFieldView.create({ name: 'search', displayWidth: 90 }); }
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
    }
  ],

  methods: {
    init: function() {
      this.searchChoice.value.addListener(this.performQuery);
      this.searchField.value.addListener(this.performQuery);

      this.syncManager.propertyValue('isSyncing').addListener(function() {
        if ( syncManager.isSyncing ) {
          this.timer.step();
          this.timer.start();
        } else {
          this.timer.stop();
          this.view.view = this.view.view;
        }
      });

      this.rowSelection.addListener(function(_,_,_,issue) {
        document.location = 'https://code.google.com/p/chromium/issues/detail?id=' + issue.id;
      });

      var logo = $('logo');
      logo.onclick = syncManager.forceSync.bind(syncManager);

      Events.dynamic(function() {
        logo.style.webkitTransform = 'rotate(' + -this.timer.i + 'deg)';
      });
    },

    /** Filter data with the supplied predicate, or select all data if null. **/
    search: function(p) {
      if ( p ) console.log('SEARCH: ', p.toSQL());
      this.view.dao = p ? IssueDAO.where(p) : IssueDAO;
    }
  }
});