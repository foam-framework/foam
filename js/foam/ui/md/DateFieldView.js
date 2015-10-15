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
  package: 'foam.ui.md',
  name: 'DateFieldView',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.md.DatePickerView',
    'foam.ui.md.PopupView',
  ],
  imports: [
    'document',
  ],
  properties: [
    {
      name: 'prop',
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop.label; }
    },
    {
      name: 'mode',
    },
    {
      name: 'floatingLabel',
      defaultValue: true
    },
    {
      name: 'className',
      defaultValueFn: function() {
        return 'md-date-field md-date-field-' + (this.mode === 'read-only' ? 'read-only' : 'writable');
      }
    },
  ],
  listeners: [
    {
      name: 'onClick',
      code: function() {
        var active = this.document.activeElement;
        if (active) active.blur();
        this.PopupView.create({
          delegate: this.DatePickerView,
          cardClass: 'md-card-shell',
          data$: this.data$
        }).open();
      }
    },
  ],
  templates: [
    function CSS() {/*
      .md-date-field.md-date-field-writable {
        height: 64px;
        margin: 8px;
        padding: 32px 8px 8px 8px;
        position: relative;
      }

      .md-date-field.md-date-field-read-only {
        display: inline-block;
      }

      .md-date-field-body {
        align-items: center;
        border-bottom: 1px solid #e0e0e0;
        padding: 8px 0;
        flex-grow: 1;
      }

      .md-date-field-read-only .md-date-field-body {
        border: none;
        display: inline-block;
        padding: 0;
      }

      .md-date-field .md-floating-label {
        font-size: 85%;
        top: 12px;
      }

      .md-date-field {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        flex-grow: 1;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <% if (this.floatingLabel) { %>
          <label id="<%= this.id %>-label" class="md-floating-label">
            <%= this.label %>
          </label>
        <% } %>
        <div class="md-date-field-body">
          <%# this.data ? this.data.toDateString() : 'Choose date' %>
        </div>
      </div>
      <% this.on('click', this.onClick, this.id); %>
    */},
  ]
});