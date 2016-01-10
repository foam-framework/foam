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
  name: 'DefaultRowView',
  package: 'foam.ui.md',
  extends: 'foam.ui.View',

  imports: [ 'removeRowFromList' ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'innerView',
      defaultValue: 'foam.ui.DetailView'
    },
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'DefaultRowView'
    }
  ],

  templates: [
    function CSS() {/*
      .DefaultRowView {
        align-items: center;
        display: flex;
        height: 72px;
        justify-content: space-between;
        line-height: 48px;
        overflow: hidden;
        padding: 4px 0 4px 8px;
        white-space: nowrap;
      }
    */},
    function toInnerHTML() {/*
      <%= this.innerView({ data: this.data }, this.Y) %>
      $$removeRow
    */}
  ],

  actions: [
    {
      name: 'removeRow',
      label: '',
      iconUrl: 'images/ic_clear_black_24dp.png',
      code: function() { this.removeRowFromList(this.data); }
    }
  ]

});
