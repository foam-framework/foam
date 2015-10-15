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
  name: 'EMailView',
  package: 'com.google.mail',
  extends: 'foam.ui.md.DetailView',
  requires: [
    'foam.ui.WebView',
    'foam.ui.md.MonogramStringView',
    'foam.ui.RelativeDateTimeFieldView',
    'foam.ui.ImageBooleanView',
    'foam.ui.ActionSheetView',
    'foam.ui.StringArrayView'
  ],
  /*
  actions: [
    {
      name: 'moreActions',
      label: '',
      isEnabled: function() { return true; },
      iconUrl: 'icons/ic_more_horiz_white_24dp.png',
      code: function() {
        var actionSheet = this.ActionSheetView.create({
          data: this.data,
          actions: this.data.model_.actions,
        }, this.Y);
        this.X.stack.slideView(actionSheet);
      },
    },
  ],
  */
  templates: [
    function CSS() {/*
      .actionButtonCView-moreActions {
        margin-right: 10px;
      }
      .email-view {
      }
      .email-view .content {
        align-items: stretch;
        display: flex;
        flex-direction: column;
        margin: 0 18px 18px;
        word-break: word;
      }
      .email-view .content iframe {
        border: none;
        overflow: hidden;
        padding: 0;
      }

      .email-view .monogram-string-view {
        margin: auto 6px auto 0;
      }

      .email-view .from {
        font-size: 14px;
        font-weight: bold;
        display: block;
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .email-view .details {
        font-size: 12px;
        color: rgb(119, 119, 119);
        overflow-x: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .email-view .subject {
        color: #fff;
        display: block;
        font-size: 20px;
        line-height: 28px;
        margin: auto;
        overflow-x: hidden;
        padding: 0px 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        -webkit-box-flex: 1.0;
      }

      .email-view .body {
        white-space: pre-wrap;
        margin-top: 20px;
        display: block;
      }

    */},
    function toHTML() {/*
      <% this.destroy(); %>
      <div id="<%= this.id %>" class="email-view">
        <div class="content">
          <div style="display: flex; display: -webkit-flex">
            $$from{model_: 'foam.ui.md.MonogramStringView'}
            <div style='flex: 1; -webkit-flex: 1'>
              $$from{mode: 'read-only', floatingLabel: false, className: 'from', escapeHTML: true}
              <div class='details'>
                $$to{mode: 'read-only'}
                $$cc{mode: 'read-only'}
                <br>
                $$timestamp{ model_: 'foam.ui.RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
              </div>
            </div>
            $$starred{
              model_: 'foam.ui.ImageBooleanView',
              className:  'actionButton',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
          $$body{ model_: 'foam.ui.WebView', className: 'body' }
        </div>
      </div>
    */}
  ]
});
