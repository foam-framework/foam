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
  name: 'LabelCitationView',
  package: 'foam.apps.mbug.ui',
  extendsModel: 'foam.ui.md.DefaultRowView',
  traits: ['foam.ui.md.ColoredBackgroundTrait'],
  properties: [ { name: 'className', defaultValue: 'LabelCitationView' } ],
  templates: [
    function CSS() {/*
      .IssueLabel {
        align-items: center;
        border-radius: 50px;
        border: 1px solid rgba(0,0,0,.1);
        color: white;
        display: flex;
        flex-direction: row;
        font-size: 14px;
        margin-right: 12px;
        margin-top: 12px;
        padding: 10px;
        padding-left: 28px;
      }
      .IssueLabel canvas {
        background: rgba(0,0,0,0) !important;
      }
      .LabelCitationView {
        margin-left: 16px;
      }
    */},
    function toInnerHTML() {/*
      <div class="IssueLabel" <%= this.generateColorStyle(this.data.match(/[^-]+/)[0]) %>>
        <div style="flex: 1 0 auto; -webkit-flex: 1 0 auto">{{ this.data }}</div>
        $$removeRow{width: 20, height: 20, iconUrl: 'images/ic_clear_24dp.png'}
      </div>
    */}
  ]
});
