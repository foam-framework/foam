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
  name: 'EMailCitationView',
  package: 'com.google.mail',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.ui.md.MonogramStringView',
    'foam.ui.RelativeDateTimeFieldView',
    'foam.ui.ImageBooleanView'
  ],
  imports: [
    'controller'
  ],
  properties: [
    { name: 'className', defaultValue: 'email-citation' },
    {
      name: 'preferredHeight',
      help: 'Specifying the preferred height of this view for the ScrollView, since an empty row is too small.',
      defaultValue: 82
    }
  ],
  templates: [
    function CSS() {/*
      .email-citation {
        display: flex;
        display: -webkit-flex;
        border-bottom: solid #B5B5B5 1px;
        padding: 10px 14px 10px 6px;
        height: 82px;
      }

      .email-citation.unread {
        font-weight: bold;
      }

      .email-citation .from {
        display: block;
        font-size: 17px;
        line-height: 24px;
        white-space: nowrap;
        overflow-x:hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        -webkit-flex-grow: 1;
      }

      .email-citation .timestamp {
        font-size: 12px;
        color: rgb(17, 85, 204);
        white-space: nowrap;
        flex-shrink: 0;
        -webkit-flex-shrink: 0;
      }

      .email-citation .subject {
        display: block;
        font-size: 13px;
        line-height: 17px;
        overflow-x:hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .snippet {
        color: rgb(119, 119, 119);
        display: block;
        font-size: 13px;
        height: 20px;
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .monogram-string-view {
        margin: auto 6px auto 0;
      }
    */},
    function toHTML() {/*
      <%
        var id = this.setClass('unread', function() { return self.data && self.data.unread; }, this.id);
      %>

      <div id="<%= id %>" %%cssClassAttr() >
        $$from{model_: 'foam.ui.md.MonogramStringView'}
        <div style="flex: 1; -webkit-flex: 1">
          <div style="display: flex; display: -webkit-flex">
            $$from{mode: 'read-only', className: 'from', escapeHTML: true}
            $$timestamp{ model_: 'foam.ui.RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
          </div>
          <div style="display: flex; display: -webkit-flex">
            <div style='flex-grow: 1; -webkit-flex-grow: 1'>
              $$subject{mode: 'read-only', className: 'subject'}
              $$snippet{mode: 'read-only', className: 'snippet'}
            </div>
            $$starred{
              model_: 'foam.ui.ImageBooleanView',
              className:  'star',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
        </div>
      </div>
    */}
   ]
});
