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
  package: 'foam.apps.mbug.ui',
  name: 'IssueView',

  extends: 'foam.ui.UpdateDetailView',
  traits: ['foam.input.touch.VerticalScrollNativeTrait'],

  requires: [
    'foam.apps.mbug.ui.CitationRowView',
    'foam.apps.mbug.ui.CitationView',
    'foam.apps.mbug.ui.CommentView',
    'foam.apps.mbug.ui.LabelCitationView',
    'foam.apps.mbug.ui.LabelView',
    'foam.apps.mbug.ui.PersonView',
    'foam.apps.mbug.ui.PriorityView',
    'foam.apps.quickbug.model.QIssueComment',
    'foam.apps.quickbug.model.QIssueLabel',
    'foam.apps.quickbug.model.imported.IssuePerson',
    'foam.ui.DAOListView',
    'foam.ui.ImageBooleanView',
    'foam.ui.PopupChoiceView',
    'foam.ui.md.AddRowView',
    'foam.ui.md.AutocompleteListView',
    'foam.ui.md.TextFieldView'
  ],
  imports: [
    'PersonDAO',
    'issueLabelDAO',
    'stack'
  ],
  properties: [
    {
      name: 'scrollerID',
      getter: function() { return this.id + '-scroller'; }
    }
  ],
  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png'
    },
    {
      name: 'save',
      label: '',
      iconUrl: 'images/ic_done_24dp.png'
    }
  ],
  listeners: [
    {
      name: 'onOwnerClick',
      code: function() {
        // TODO(braden): Disabling the transition here because it's janky.
        // The browser tries to focus the input box right away, and that
        // makes it scroll to the right and screw up the slide transition.
        this.stack.pushView(this.AddRowView.create({
          dao: this.PersonDAO,
          data$: this.data.owner$,
          subType: this.IssuePerson,
          subKey: this.IssuePerson.NAME,
          rowView: 'foam.apps.mbug.ui.PersonView'
        }), undefined, undefined, 'none');
      }
    }
  ],
  templates: [
    function CSS() {/*
      .content-view {
        margin-top: -24px;
      }
      .expand {
        flex: 1 1 auto;
      }
    */},
    function headerToHTML() {/*
      <div class="header">
        <div class="toolbar">
          $$back
          $$cancel
          <span class="expand"></span>
          $$save
          $$starred{
            model_: 'foam.ui.ImageBooleanView',
            className:  'star',
            trueImage:  'images/ic_star_white_24dp.png',
            falseImage: 'images/ic_star_outline_white_24dp.png'
          }
        </div>
        <div class="title">
          #&nbsp;$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
        </div>
      </div>
    */},

    // TODO: get options from QProject
    function bodyToHTML() {/*
      <div class="body">
        <div id="<%= this.id %>-scroller" class="body-scroller">
          <div class="choice">
          <% if ( this.data.pri ) { %>
            $$pri{ model_: 'foam.apps.mbug.ui.PriorityView' }
            $$pri{
              model_: 'foam.ui.PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } else { %>
            $$priority{ model_: 'foam.apps.mbug.ui.PriorityView' }
            $$priority{
              model_: 'foam.ui.PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } %>
          </div>
          <div class="choice">
            <img src="images/ic_keep_24dp.png" class="status-icon">
            $$status{
                model_: 'foam.ui.PopupChoiceView',
                iconUrl: 'images/ic_arrow_drop_down_24dp.png',
                showValue: true,
                dao: this.X.StatusDAO,
                objToChoice: function(o) { return [o.status, o.status]; }
              }
          </div>

          <div class="separator separator1"></div>
          <div id="<%= this.on('click', this.onOwnerClick) %>" class="owner">
            $$owner{model_: 'foam.apps.mbug.ui.CitationView'}
          </div>

          <div class="separator separator1"></div>
          <% out(this.AutocompleteListView.create({
            data$: this.data.cc$,
            inline: true,
            srcDAO: this.PersonDAO,
            rowView: 'foam.apps.mbug.ui.CitationRowView',
            acRowView: 'foam.apps.mbug.ui.PersonView',
            prop: X.ReferenceArrayProperty.create({
              name: 'cc',
              subType: this.IssuePerson,
              subKey: this.IssuePerson.NAME
            }),
            queryFactory: function(q) {
              return STARTS_WITH_IC(self.IssuePerson.NAME, q);
            }
          })); %>

          <div class="separator separator1"></div>
          <% out(this.AutocompleteListView.create({
            data$: this.data.labels$,
            srcDAO: this.issueLabelDAO,
            inline: true,
            rowView: 'foam.apps.mbug.ui.LabelCitationView',
            acRowView: 'foam.apps.mbug.ui.LabelView',
            prop: X.ReferenceArrayProperty.create({
              name: 'labels',
              subType: this.QIssueLabel,
              subKey: this.QIssueLabel.LABEL
            }),
            queryFactory: function(q) {
              return STARTS_WITH_IC(self.QIssueLabel.LABEL, q);
            }
          })); %>

          <div class="separator separator1"></div>
          $$content{
            model_: 'foam.ui.md.TextFieldView',
            label: 'Add Comment',
            onKeyMode: true,
            extraClassName: 'content-view' }
          $$comments{
            model_: 'foam.ui.DAOListView',
            dao: this.data.comments.orderBy(DESC(this.QIssueComment.PUBLISHED)),
            mode: 'read-only',
            rowView: 'foam.apps.mbug.ui.CommentView' }
        </div>
      </div>
    */},

    function toHTML() {/*
      <div id="<%= this.id %>" class="issue-edit">
        <%= this.headerToHTML() %>
        <%= this.bodyToHTML() %>
      </div>
    */}
  ]
});
