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
  package: 'foam.apps.quickbug.ui',
  name: 'IssueLink',
  extends: 'foam.ui.View',

  imports: [
    'issueDAO',
    'browser'
  ],

  requires: [
    'foam.apps.quickbug.ui.QIssueTileView',
    'foam.ui.PopupView'
  ],

  properties: [
    {
      name: 'issue'
    },
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'maxDepth',
      defaultValue: 0
    },
  ],

  methods: {
    toHTML: function(opt_depth) {
      this.on('click',     this.editIssue.bind(this, this.issue),    this.id);
      this.on('mouseover', this.startPreview.bind(this, this.issue), this.id);
      this.on('mouseout',  this.endPreview,                          this.id);

      return '<a href="" id="' + this.id + '">Issue ' + this.issue + '</a>';
    },

    initHTML: function() {
      this.SUPER();

      var self = this;

      this.issueDAO.find(this.issue, { put: function(issue) {
        if ( ! self.$ ) return; // stale

        if ( ! issue.isOpen() ) {
          self.$.style.textDecoration = 'line-through';
        }

        if ( self.maxDepth > 1 ) {
          var ids = issue[self.property.name];

          if ( ids.length ) {
            var subView = self.X.lookup('foam.apps.quickbug.ui.BlockView').create({
              property: self.property,
              maxDepth: self.maxDepth-1,
              ids:      ids
            }, self.Y);

            self.$.insertAdjacentHTML(
              'afterend',
              '<div style="margin-left:10px;">' + subView.toHTML() + '</div>');

            subView.initHTML();
          }
        }
      }});
    }
  },

  listeners: [
    {
      name: 'editIssue',
      code: function(id) { this.browser.location.id = id; }
    },
    {
      name: 'startPreview',
      code: function(id, e) {
        if ( this.currentPreview ) return;

        var self = this;
        this.issueDAO.find(id, { put: function(issue) {
          self.currentPreview = self.PopupView.create({
            x: e.x+30,
            y: e.y-20,
            view: self.QIssueTileView.create({issue: issue})
          });

          self.currentPreview.open(self);
        }});
      }
    },
    {
      name: 'endPreview',
      code: function() {
        if ( ! this.currentPreview ) return;
        this.currentPreview.close();
        this.currentPreview = null;
      }
    }
  ]

});
