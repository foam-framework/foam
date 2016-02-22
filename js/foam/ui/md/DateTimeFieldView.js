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
  name: 'DateTimeFieldView',
  extends: 'foam.ui.md.DateFieldView',

  requires: [
    'foam.ui.md.TimePickerView'
  ],

  listeners: [
    {
      name: 'onTimeClick',
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
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <% if (this.floatingLabel) { %>
          <label id="<%= this.id %>-label" class="md-floating-label">
            <%= this.label %>
          </label>
        <% } %>
        <div id="<%= this.id %>-date" class="md-date-field-body">
          <%# this.data ? this.data.toDateString() : 'Choose date' %>
        </div>
        <div id="<%= this.id %>-time" class="md-date-field-body">
          <%# this.data ? this.data.toTimeString() : 'Choose time' %>
        </div>
      </div>
      <% this.on('click', this.onClick, this.id+'-date'); %>
      <% this.on('click', this.onTimeClick, this.id+'-time'); %>
    */}
  ]
});
