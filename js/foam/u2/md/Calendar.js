/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.md',
  name: 'Calendar',
  extends: 'foam.u2.View',

  imports: [
    'MONTH_NAMES',
    'document'
  ],

  documentation: 'A view for a calendar month. Not intended to be used ' +
      'directly! This is a subcomponent of DateField and DatePicker. ' +
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
    },
    function initE() {
      this.cls(this.myCls());

      this.start()
          .cls(this.myCls('heading'))
          .start('span')
              .cls(this.myCls('heading-month'))
              .add(this.MONTH_NAMES[this.month] + ' ' + this.year)
              .end()
          .end();

      var table = this.start()
          .cls(this.myCls('body'))
          .start('table');

      table.cls(this.myCls('table'));
      table.start('tr')
          .start('th').add('S').end()
          .start('th').add('M').end()
          .start('th').add('T').end()
          .start('th').add('W').end()
          .start('th').add('T').end()
          .start('th').add('F').end()
          .start('th').add('S').end()
          .end();

      var firstDay = new Date(this.year, this.month, 1).getDay();
      for ( var row = 0 ; row < 6 ; row++ ) {
        var tr = table.start('tr');
        for ( var col = 0 ; col < 7 ; col++ ) {
          if ( row === 0 && col < firstDay ) {
            tr.start('td').end();
          } else {
            var day = row * 7 + (col - firstDay) + 1;
            var testDate = new Date(this.year, this.month, day, this.hour, this.minute);
            if ( testDate.getMonth() != this.month ) {
              tr.start('td').end();
            } else {
              tr.start('td')
                  .cls(this.dynamic(function(day) {
                    return this.isSelected(day) ? this.myCls('selected') :
                        this.isToday(day) ? this.myCls('today') : '';
                  }.bind(this, day), this.data$))
                  .add(day)
                  .end();
            }
          }
        }
        tr.end();
      }

      table.on('click', this.onClick);

      // End the table and the containing body.
      table.end().end();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        height: 310px;
        width: 300px;
      }
      ^heading {
        align-items: center;
        display: flex;
        font-size: 14px;
        height: 48px;
        justify-content: center;
      }

      ^body {
        display: flex;
        justify-content: center;
      }

      ^table {
        font-size: 12px;
      }
      ^table th {
        color: #999;
        font-weight: normal;
        text-align: center;
      }
      ^table td {
        height: 40px;
        text-align: center;
        width: 38px;
      }

      ^selected {
        background-color: #4285f4;
        border-radius: 50%;
        color: #fff;
      }
      ^today {
        color: #4285f4;
        font-weight: bolder;
      }
    */},
  ]
});
