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
  name: 'DatePickerView',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.md.CalendarView',
  ],
  imports: [
    'animate',
    'gestureManager',
    'popup',
    'window',
  ],
  exports: [
    'MONTH_NAMES',
  ],

  documentation: 'A Material Design date picker widget. Intended to be shown ' +
      'inside a $$DOC{ref:"foam.ui.md.PopupView"} by a ' +
      '$$DOC{ref:"foam.ui.md.DateFieldView"}. Requires a $$DOC{ref:"foam.input.touch.GestureManager"}!',

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.softData = nu;
      },
    },
    {
      name: 'softData',
      factory: function() {
        return new Date();
      },
      adapt: function(old, nu) {
        if (typeof nu === 'string') return new Date(nu);
        if ( ! nu ) return new Date();
        return nu;
      },
      postSet: function(old, nu) {
        this.year = nu.getFullYear();
        this.month = nu.getMonth();
        this.date = nu.getDate();
        this.day = nu.getDay();
      },
    },
    {
      name: 'years',
      factory: function() {
        var years = [];
        for (var i = 1900; i <= 2100; i++) {
          years.push(i);
        }
        return years;
      }
    },
    {
      name: 'year',
      documentation: 'The real, currently selected year.',
    },
    {
      name: 'month',
      documentation: 'The real, currently selected month (0-based).',
    },
    {
      name: 'date',
      documentation: 'The real, currently selected date.',
    },
    {
      name: 'day',
      documentation: 'The real, currently selected day of the week (0=Sunday).',
    },
    {
      name: 'viewYear',
      documentation: 'The year currently being viewed.',
      factory: function() { return this.year; },
      postSet: function(old, nu) {
        if (old !== nu) this.reconstructCalendars();
      },
    },
    {
      name: 'viewMonth',
      documentation: 'The month currently being viewed (0-based).',
      factory: function() { return this.month; },
      postSet: function(old, nu) {
        if (old !== nu) this.reconstructCalendars();
      },
    },
    {
      name: 'leftYear',
      documentation: 'The year currently being viewed by the left-hand swipe.',
      getter: function() { return this.leftMonth === 11 ? this.viewYear - 1 : this.viewYear; }
    },
    {
      name: 'leftMonth',
      documentation: 'The month currently being viewed (0-based).',
      getter: function() { return Math.max(0, this.viewMonth - 1); }
    },
    {
      name: 'rightYear',
      documentation: 'The year currently being viewed.',
      getter: function() { return this.rightMonth === 0 ? this.viewYear + 1 : this.viewYear; }
    },
    {
      name: 'rightMonth',
      documentation: 'The month currently being viewed (0-based).',
      defaultValueFn: function() {
        var m = this.viewMonth + 1;
        if ( m > 11 ) m = 0;
        return m;
      }
    },
    {
      name: '$slider',
      getter: function() { return this.X.$(this.id + '-slider'); }
    },
    {
      name: '$inner',
      getter: function() { return this.X.$(this.id + '-inner'); }
    },
    {
      name: 'width',
      documentation: 'The width of the outermost element.',
      defaultValue: 300
    },
    {
      name: 'x',
      documentation: 'X coordinate of the translation currently',
      hidden: true,
      transient: true,
      postSet: function(old, nu) {
        this.adjustX(nu);
      },
    },
    {
      name: 'swipeGesture',
      factory: function() {
        return this.GestureTarget.create({
          containerID: this.id + '-body',
          handler: this,
          gesture: 'horizontalScroll'
        });
      }
    },
    {
      name: 'calendarViews_',
      factory: function() {
        return [];
      }
    },
    {
      type: 'Boolean',
      name: 'showYears_',
      defaultValue: false
    },
    {
      name: 'className',
      defaultValue: 'date-picker'
    },
  ],

  constants: {
    // TODO(braden): i18n. The whole business of calendars and dates is a deep
    // well of i18n problems.
    DAY_NAMES: [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat'
    ],
    MONTH_NAMES: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
  },

  listeners: [
    {
      name: 'adjustX',
      isFramed: true,
      code: function() {
        this.rawAdjustX(this.x);
      }
    },
    {
      name: 'horizontalScrollMove',
      code: function(dx, tx) {
        var x = this.width - tx;
        if ( x < 0 ) x = 0;
        if ( x > 2 * this.width ) x = 2 * this.width;
        this.x = x;
      }
    },
    {
      name: 'horizontalScrollEnd',
      code: function(dx, tx, x) {
        var adj = 0;

        if ( Math.abs(tx) > this.width / 3 ) {
          // > 1/3 of a width is sufficient to snap.
          if ( tx > 0 ) {
            adj = -1;
          } else {
            adj = 1;
          }
        }
        this.snapToView(adj);
      }
    },
    {
      name: 'reconstructCalendars',
      isFramed: true,
      documentation: 'Called whenever viewMonth changes. Centers a calendar ' +
          'for the currently viewed month, and creates the adjacent months.',
      code: function() {
        var newCals = [
          this.CalendarView.create({ data$: this.softData$, year: this.leftYear, month: this.leftMonth }),
          this.CalendarView.create({ data$: this.softData$, year: this.viewYear, month: this.viewMonth }),
          this.CalendarView.create({ data$: this.softData$, year: this.rightYear, month: this.rightMonth })
        ];
        for (var i = 0 ; i < 3 ; i++) {
          if (this.calendarViews_[i]) this.calendarViews_[i].destroy();
          this.calendarViews_[i] = newCals[i];
        }
        this.$inner.innerHTML = '';
        // TODO(braden): Setting this.x should be sufficient, but it causes jank
        // because this.X.postSet calls adjustX, which is also framed. Therefore
        // there's a frame between rendering the new calendars and fixing the
        // slider. Once calling one framed listener from another fires
        // immediately rather than waiting for next frame, the rawAdjustX call
        // here can be removed, and rawAdjustX can be folded into adjustX.
        // This workaround causes rawAdjustX to be called twice with the same
        // value, which is wasteful but harmless.
        this.x = this.width;
        this.rawAdjustX(this.width);
        for (i = 0 ; i < 3 ; i++) {
          this.$inner.insertAdjacentHTML('beforeend', newCals[i].toHTML());
          newCals[i].initHTML();
        }
      }
    },
    {
      name: 'headerClick',
      isFramed: true,
      documentatin: 'Called to flip the mode from calendar view to years view.',
      code: function() {
        this.showYears_ = !this.showYears_;
        if (this.showYears_) {
          this.scrollToYear();
        }
      }
    },
    {
      name: 'scrollToYear',
      isFramed: true,
      code: function() {
        // Since scrollIntoView() puts it at the top, we actually want to scroll
        // three years earlier to the top. Clamp to 1900.
        var targetYear = Math.max(1900, this.viewYear - 3);
        var e = this.X.$(this.id + '-year-' + targetYear);
        if (e) e.scrollIntoView();
      }
    },
    {
      name: 'pickYear',
      code: function(year) {
        this.year = this.viewYear = year;
        this.softData = new Date(this.year, this.month, this.date, this.softData.getHours(), this.softData.getMinutes());
        this.showYears_ = false;
      }
    },
  ],

  methods: [
    function init(args) {
      this.SUPER(args);
      this.gestureManager.install(this.swipeGesture);
    },
    function snapToView(adj) {
      // Animates a slide to the view in question, and then adjusts the views
      // behind the scenes.
      // First we compute the new target X coordinate, month and year.
      var month = this.viewMonth;
      var year = this.viewYear;
      var targetX = this.width;

      if (adj < 0) {
        month--;
        if ( month < 0 ) {
          month = 11;
          year--;
        }
        targetX = 0;
      } else if (adj > 0) {
        month++;
        if ( month > 11 ) {
          month = 0;
          year++;
        }
        targetX = this.width * 2;
      }

      var time = 300 * (Math.abs(targetX - this.x) / this.width);
      var self = this;
      this.animate(time, function(evt) { self.x = targetX; },
          Movement.ease(0.8, 0.4),
          function() {
            self.viewYear = year;
            self.viewMonth = month;
          })();
    },
    function rawAdjustX(x) {
      var str = 'translate3d(-' + x + 'px, 0, 0)';
      var e = this.$slider;
      e.style.transform = e.style['-webkit-transform'] = str;
    },
  ],

  actions: [
    {
      name: 'cancel',
      label: 'CANCEL',
      code: function() {
        this.popup.close();
      }
    },
    {
      name: 'ok',
      label: 'OK',
      code: function() {
        this.data = this.softData;
        this.popup.close();
      }
    },
    {
      name: 'left',
      label: '<',
      code: function() {
        this.snapToView(-1);
      }
    },
    {
      name: 'right',
      label: '>',
      code: function() {
        this.snapToView(1);
      }
    },
  ],

  templates: [
    function CSS() {/*
      .hidden {
        display: none !important;
      }
      .date-picker {
        cursor: pointer;
      }

      .date-picker-header {
        background-color: #3e50b4;
        color: #fff;
        font-size: 16px;
        padding: 12px 16px;
      }
      .date-picker-header div {
        opacity: 0.8;
      }
      .date-picker-header div.selected {
        opacity: 1;
      }
      .date-picker-header-year {
        margin: 8px 0;
      }
      .date-picker-header-date {
        font-size: 24px;
        font-weight: bolder;
      }

      .date-picker-body {
        height: 310px;
        overflow: hidden;
        position: relative;
        -webkit-user-select: none;
        user-select: none;
        width: 300px;
      }
      .date-picker-slider {
        position: absolute;
        height: 100%;
        top: 0;
        width: 900px;
      }
      .date-picker-slider-inner {
        display: flex;
        height: 100%;
        position: relative;
        width: 100%;
      }

      .date-picker-buttons {
        align-items: center;
        display: flex;
        justify-content: flex-end;
      }

      .date-picker-switcher {
        align-items: center;
        display: flex;
        height: 48px;
        position: absolute;
        z-index: 3;
      }
      .date-picker-switcher-left {
        left: 0;
      }
      .date-picker-switcher-right {
        right: 0;
      }

      .date-picker-years {
        align-items: center;
        display: flex;
        flex-direction: column;
        height: 310px;
        overflow-y: scroll;
        width: 300px;
      }
      .date-picker-years-year {
        flex-shrink: 0;
        padding: 16px;
      }
      .date-picker-years-year.selected {
        color: #3e50b4;
        font-size: 24px;
        font-weight: bold;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div id="<%= this.id %>-header" class="date-picker-header">
          <div id="<%= this.id %>-header-year" class="date-picker-header-year">
            <%# this.year %>
          </div>
          <div id="<%= this.id %>-header-date" class="date-picker-header-date">
            <%# this.DAY_NAMES[this.day] + ', ' + this.MONTH_NAMES[this.month] +
                ' ' + this.date %>
          </div>
          <% this.setClass('selected', function() { return self.showYears_; }, this.id + '-header-year'); %>
          <% this.setClass('selected', function() { return ! self.showYears_; }, this.id + '-header-date'); %>
        </div>
        <% this.on('click', this.headerClick, this.id + '-header'); %>
        <div id="<%= this.id %>-body" class="date-picker-body">
          <span class="date-picker-switcher date-picker-switcher-left">
            $$left{ model_: 'foam.ui.md.FlatButton', color: '#000' }
          </span>
          <span class="date-picker-switcher date-picker-switcher-right">
            $$right{ model_: 'foam.ui.md.FlatButton', color: '#000' }
          </span>
          <div id="<%= this.id %>-slider" class="date-picker-slider">
            <div id="<%= this.id %>-inner" class="date-picker-slider-inner">
            </div>
          </div>
        </div>
        <div id="<%= this.id %>-years" class="date-picker-years">
          <% for (var i = 1900; i <= 2100; i++) { %>
            <span id="<%= this.id %>-year-<%= i %>" class="date-picker-years-year"><%= i %></span>
            <% this.setClass('selected', function(i) { return self.viewYear === i; }.bind(this, i), this.id + '-year-' + i); %>
            <% this.on('click', this.pickYear.bind(this, i), this.id + '-year-' + i); %>
          <% } %>
        </div>
        <%
          this.setClass('hidden', function() { return self.showYears_; }, this.id + '-body');
          this.setClass('hidden', function() { return ! self.showYears_; }, this.id + '-years');
        %>
        <div class="date-picker-buttons">
          $$cancel{ model_: 'foam.ui.md.FlatButton' }
          $$ok{ model_: 'foam.ui.md.FlatButton' }
        </div>
      </div>
    */},
  ]
});
