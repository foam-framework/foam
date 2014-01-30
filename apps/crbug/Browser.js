/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var Browser = Model.create({
  name: 'Browser',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'project'
    },
    {
      name: 'qbug',
      scope: 'project',
      defaultValueFn: function() { return this.project.qbug; }
    },
    {
      name: 'projectName',
      scope: 'project',
      defaultValueFn: function() { return this.project.projectName; }
    },
    {
      name: 'summary',
      scope: 'project',
      defaultValueFn: function() { return this.project.summary; }
    },
    {
      name: 'url',
      scope: 'project',
      defaultValueFn: function() { return this.project.url; }
    },
    {
      name: 'userView',
      valueFactory: function() {
        var view = TextFieldView.create(QUser.EMAIL);
        view.copyFrom({
          mode: 'read-only',
          escapeHtml: true
        });
        return view;
      },
      postSet: function(newValue, oldValue) {
        // TODO clean this up when scopes are implemented.
        newValue.setValue(this.project.user.propertyValue('email'));
      }
    },
    {
      name: 'IssueDAO',
      scope: 'project',
      defaultValueFn: function() { return this.project.IssueDAO; }
    },
    {
      name: 'IssueCommentDAO',
      scope: 'project',
      defaultValueFn: function() { return this.project.IssueCommentDAO; }
    },
    {
      name: 'syncManager',
      scope: 'project',
      defaultValueFn: function() { return this.project.syncManager; }
    },

    {
      name: 'rowSelection',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name: 'window'
    },
    {
      name: 'timer',
      valueFactory: function() { return Timer.create(); }
    },
    {
      name: 'view',
      valueFactory: function() { return createView(this.rowSelection, this); }
    },
    {
      name: 'memento',
      setter: function(m) {
        this.searchChoice.memento = m.can;
        if ( m.hasOwnProperty('q') ) this.searchField.value.set(m.q);
        this.view.memento = m;
      },
      getter: function() {
        var m = this.view.memento;
        m.can = this.searchChoice.memento;
        // Parse and reformat the query so that it doesn't use shortnames that cr1bug won't understand
        m.q = (QueryParser.parseString(this.searchField.value.get()) || TRUE).partialEval().toMQL();
        return m;
      }
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
      name: 'searchChoice',
      valueFactory: function() {
        return ChoiceView.create({
          helpText: 'Search within:',
          choices:[
            ['',                            '&nbsp;All issues'],
            ['-status=Closed,Fixed,Done',   '&nbsp;Open issues'], // Should this be just 'Closed'?
            ['owner=me -status=Closed',     '&nbsp;Open and owned by me'],
            ['-status=Closed reporter=me',  '&nbsp;Open and reported by me'],
            ['-status=Closed is:starred',   '&nbsp;Open and starred by me'],
            ['-status=Closed commentby:me', '&nbsp;Open and comment by me'],
            ['status=New',                  '&nbsp;New issues'],
            ['status=Fixed,Done',           '&nbsp;Issues to verify']
          ]});
      }
    },
    {
      name: 'searchField',
      valueFactory: function() { return TextFieldView.create({ name: 'search', displayWidth: 60 }); }
    },
    {
      name: 'logo',
      valueFactory: function() {
        return ImageView.create({value: SimpleValue.create(this.url + '/logo')});
      }
    }
  ],

  listeners: [
    {
      model_: 'Method',
      name: 'performQuery',
      code: function(evt) {
        this.maybeImportCrbugUrl(this.searchField.value.get());

        this.search(AND(
          QueryParser.parseString(this.searchChoice.value.get()) || TRUE,
          QueryParser.parseString(this.searchField.value.get()) || TRUE
        ).partialEval());
      }
    },
    {
      model_: 'Method',
      name: 'layout',
      code: function() {
        var H = window.innerHeight;
        this.view.$.style.height = (H-this.view.$.offsetTop-30) + 'px';

        console.log(this.crbugUrl());
      }
    }
  ],

  actions: [
    {
      model_: 'Action',
      name:  'link',
//      label: '',
//      iconUrl: 'images/link.svg',
      help:  'Link',
      action: function() {
        var url = this.crbugUrl();
        console.log(url);
        this.openURL(url);
      }
    },
    {
      model_: 'Action',
      name:  'launchBrowser',
//      iconUrl: 'images/link.svg',
      help:  'Link',
      action: function() {
        this.project.launchBrowser();
      }
    },
    {
      model_: 'Action',
      name:  'launchSync',
      label: 'Sync Status',
      action: function() {
        console.log('launch sync');
        this.project.launchSync();
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.window.addEventListener('resize', this.layout, false);

      this.searchChoice.value.addListener(this.performQuery);
      this.searchField.value.addListener(this.performQuery);

      this.syncManager.propertyValue('isSyncing').addListener(function() {
        if ( this.syncManager.isSyncing ) {
          this.timer.step();
          this.timer.start();
        } else {
          this.timer.stop();
          this.view.choice = this.view.choice;
        }
      }.bind(this));

      this.rowSelection.addListener(function(_,_,_,issue) {
        var url = this.url + '/issues/detail?id=' + issue.id;
        this.openURL(url);
      }.bind(this));

      this.logo.$.onclick = this.syncManager.forceSync.bind(this.syncManager);

      var timer = this.timer;
      Events.dynamic(function() {
        this.logo.$.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
      }.bind(this));

      this.layout();
      this.search(TRUE);
    },

    preview: function() {},

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

      console.log(this.crbugUrl());
    },

    // Crbug doesn't order canned-queries sequentially
    idToCrbugCan: [1, 2, 3, 4, 5, 8, 6, 7],
    crbugCanToId: [0, 0, 1, 2, 3, 4, 6, 7, 5],

    /** Import a cr(1)bug URL. **/
    maybeImportCrbugUrl: function(url) {
      url = url.trim();
      if ( ! url ) return;
      if ( ! url.startsWith('http') ) return;

      var idx = url.indexOf('?');
      if ( idx == -1 ) return;

      url = url.substring(idx+1);
      var params = url.split('&');
      var memento = {};
      for ( var i = 0 ; i < params.length ; i++ ) {
        var param = params[i];
        var keyValue = param.split('=');
        memento[decodeURIComponent(keyValue[0])] =
          decodeURIComponent(keyValue[1]).replace(/\+/g, ' ');
      }

      if ( memento.hasOwnProperty('can') ) memento.can = this.crbugCanToId[memento.can];

      this.memento = memento;
    },

    /** Convert current state to a cr(1)bug URL. **/
    crbugUrl: function() {
      var u = this.url + '/issues/list';
      var m = this.memento;
      var d = '?';

      if ( m.hasOwnProperty('can') ) m.can = this.idToCrbugCan[m.can];

      for ( var key in m ) {
        u += d;

        u += key + '=' + encodeURIComponent(m[key]);
        d = '&';
      }

      console.log('*****************URL ', u);

      return u;
    },

    openURL: function(url) {
      document.location = url;
    }
  },

  templates: [
    { name: "toHTML" }
  ]
});


/** A subclass of Browser which works as a Chrome-App. **/
var ChromeAppBrowser = Model.create({
  name: 'ChromeAppBrowser',

  extendsModel: 'Browser',
  
  properties: [
    {
      name: 'previewID'
    }
  ],

  methods: {
    openURL: function(url) {
      console.log('openURL: ', url);
      window.open(url);
    },

    /** Open a preview window when the user hovers over an issue id. **/
    preview: function(e, id) {
      if ( id === this.previewID ) return;
      if ( this.previewID ) this.currentPreview.close();
      this.previewID = id;
      if ( ! id ) return;

      var self = this;
      this.IssueDAO.find(id, {
        put: function(obj) {
          var v = self.currentPreview = obj.createPreviewView();

          // TODO take this from relationships
          v.QIssueCommentDAO = self.IssueCommentDAO.where(EQ(QIssue.ID, id));
          v.QIssueDAO = self.IssueDAO;
          v.value = SimpleValue.create(obj);

          self.view.$.insertAdjacentHTML('beforebegin', v.toHTML());
          v.$.style.left = e.x + 25;
          v.$.style.height = '400px';
          var viewHeight = v.$.style.height.replace('px','');
          var screenHeight = self.view.$.ownerDocument.defaultView.innerHeight;
          var top = e.y - viewHeight/2;
          v.$.style.top = Math.min(
            screenHeight-15-viewHeight,
            Math.max(
              100,
              Math.min(screenHeight-viewHeight-15, top)));

          v.initHTML();
        }
      });
    }
  }

});
