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
  name: 'TimeFieldView',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.md.PopupView',
    'foam.ui.md.TimePickerView',
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
      name: 'showSeconds',
      defaultValue: false
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
        return 'md-time-field md-time-field-' + (this.mode === 'read-only' ?
            'read-only' : 'writable');
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
          delegate: this.TimePickerView,
          cardClass: 'md-card-shell',
          data$: this.data$
        }).open();
      }
    },
  ],

  templates: [
    function CSS() {/*
      .md-time-field.md-time-field-writable {
        margin: 8px;
        min-width: 56px;
        padding: 32px 8px 8px 8px;
        position: relative;
      }

      .md-time-field.md-time-field-read-only {
        display: inline-block;
      }

      .md-time-field-body {
        align-items: center;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: -8px;
        padding-bottom: 7px;
        flex-grow: 1;
      }

      .md-time-field-read-only .md-time-field-body {
        border: none;
        display: inline-block;
        padding: 0;
      }

      .md-time-field {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        flex-grow: 1;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <% if (this.floatingLabel) { %>
          <label id="<%= this.id %>-label" class="md-text-field-label">
            <%= this.label %>
          </label>
        <% } %>
        <div class="md-time-field-body">
          <%# this.data ? this.data.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            seconds: this.showSeconds ? '2-digit' : undefined
          }) : '&nbsp;' %>
        </div>
      </div>
      <% if (this.mode !== 'read-only') { this.on('click', this.onClick, this.id); } %>
      <% this.setClass('md-text-field-label-offset',
          function() { return self.data; }, this.id + '-label'); %>
    */},
  ]
});
