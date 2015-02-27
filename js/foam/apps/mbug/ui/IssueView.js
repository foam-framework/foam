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
  name: 'IssueView',

  package: 'foam.apps.mbug.ui',
  extendsModel: 'foam.ui.UpdateDetailView',
  traits: ['foam.input.touch.VerticalScrollNativeTrait'],
  requires: [
    'foam.apps.mbug.ui.CCView',
    'foam.apps.mbug.ui.CommentView',
    'foam.apps.quickbug.model.QIssueComment',
    'foam.ui.DAOListView',
    'foam.ui.ImageBooleanView',
    'foam.apps.mbug.ui.IssueLabelView',
    'foam.ui.PopupChoiceView',
    'foam.apps.mbug.ui.PriorityView',
    'foam.ui.md.TextFieldView'
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
  templates: [
    function CSS() {/*
      .content-view {
        margin-top: -24px;
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
          $$owner{model_: 'foam.apps.mbug.ui.CCView'}

          <div class="separator separator1"></div>
          $$cc{model_: 'foam.apps.mbug.ui.CCView'}

          <div class="separator separator1"></div>
          $$labels{model_: 'foam.apps.mbug.ui.IssueLabelView'}

          <div class="separator separator1"></div>
          $$content{model_: 'foam.ui.md.TextFieldView', label: 'Add Comment', onKeyMode: true, extraClassName: 'content-view' }
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
