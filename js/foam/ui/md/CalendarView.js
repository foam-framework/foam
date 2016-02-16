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
  name: 'CalendarView',
  extends: 'foam.ui.View',

  imports: [
    'MONTH_NAMES',
    'document'
  ],

  documentation: 'A view for a calendar month. Not intended to be used ' +
      'directly! This is a subcomponent of DateFieldView and DatePickerView. ' +
      'Expects as its $$DOC{ref:".data"} a Javascript Date object for the ' +
      'currently selected day. Uses local time, not UTC.',

  properties: [
    {
      name: 'data',
      adapt: function(old, nu) {
        if (typeof nu === 'string') return new Date(nu);
        return nu;
      }
    },
    {
      name: 'day',
      defaultValueFn: function() {
        return this.data && this.data.getDate();
      }
    },
    {
      name: 'month',
      defaultValueFn: function() {
        return this.data.getMonth();
      }
    },
    {
      name: 'year',
      defaultValueFn: function() {
        return this.data.getFullYear();
      }
    },
    {
      name: 'hour',
      defaultValueFn: function() {
        return this.data.getHours();
      }
    },
    {
      name: 'minute',
      defaultValueFn: function() {
        return this.data.getMinutes();
      }
    },
    {
      name: 'className',
      defaultValue: 'calendar',
    },
    {
      name: 'preferredWidth',
      defaultValue: 300
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        var point = e.pointMap[Object.keys(e.pointMap)[0]];
        var element = this.document.elementFromPoint(point.x, point.y);
        if ( element && element.tagName === 'TD' ) {
          var newDay = element.innerText;
          this.data = new Date(this.year, this.month, newDay, this.hour, this.minute);
        }
      }
    }
  ],

  methods: [
    function isToday(day) {
      var today = new Date();
      return this.month === today.getMonth() &&
          this.year === today.getFullYear() &&
          day === today.getDate();
    },
    function isSelected(day) {
      if ( ! this.data ) return false;
      return this.month === this.data.getMonth() &&
          this.year === this.data.getFullYear() &&
          day === this.data.getDate();
    }
  ],

  templates: [
    function CSS() {/*
      .calendar {
        height: 310px;
        width: 300px;
      }
      .calendar-heading {
        align-items: center;
        display: flex;
        font-size: 14px;
        height: 48px;
        justify-content: center;
      }

      .calendar-body {
        display: flex;
        justify-content: center;
      }

      .calendar-table {
        font-size: 12px;
      }
      .calendar-table th {
        color: #999;
        font-weight: normal;
        text-align: center;
      }
      .calendar-table td {
        height: 40px;
        text-align: center;
        width: 38px;
      }

      .calendar-selected {
        background-color: #4285f4;
        border-radius: 50%;
        color: #fff;
      }
      .calendar-today {
        color: #4285f4;
        font-weight: bolder;
      }
    */},
    function toInnerHTML() {/*
      <div class="calendar-heading">
        <span class="calendar-heading-month">
          <%= this.MONTH_NAMES[this.month] %> <%= this.year %>
        </span>
      </div>

      <div class="calendar-body">
        <table id="<%= this.id %>-table" class="calendar-table">
          <tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>
          <%
            var firstDay = new Date(this.year, this.month, 1).getDay();
            for (var row = 0; row < 6; row++) {
              %> <tr> <%
              for (var col = 0; col < 7; col++) {
                if (row === 0 && col < firstDay) {
                  %> <td></td> <%
                } else {
                  var day = row * 7 + (col - firstDay) + 1;
                  var testDate = new Date(this.year, this.month, day, this.hour, this.minute);
                  if (testDate.getMonth() != this.month) {
                    %> <td></td> <%
                  } else {
                    var css = this.isSelected(day) ? 'calendar-selected' :
                        this.isToday(day) ? 'calendar-today' : '';
                    %> <td <%= css ? 'class="' + css + '"' : '' %>>
                      <%= day %>
                    </td> <%
                  }
                }
              }
              %> </tr> <%
            }
          %>
        </table>
        <% this.on('click', this.onClick, this.id + '-table'); %>
      </div>
    */}
  ]
});
