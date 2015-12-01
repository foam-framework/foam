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
  name: 'TimePickerView',
  extends: 'foam.ui.SimpleView',
  imports: [
    'dynamicFn',
    'gestureManager',
    'popup',
  ],

  // TODO(braden): Detect 24-hour time by parsing Date.toLocaleString().
  documentation: function() {/*
    <p>Material Design time picker view for FOAM. Follows the Android one,
    rather than the MD spec, which seems to be not as up to date.</p>
    <p>A few nonobvious points about this picker:
      <ul>
        <li>Tapping the hour or minute number in the header switches modes.
        <li>Tapping the AM/PM in the header, if available, toggles between.
        <li>Tapping a number in the clock face selects that time.
        <li>Dragging the clock face slides it around minute-by-minute.
      </ul>
    </p>
    <p>Care must be taken in this implementation to not overwrite the rest of
    the Date object, which might have been set by a companion date picker. If,
    however, $$DOC{ref:".data"} is not set, it becomes a new Date set to the
    current time.</p>
  */},

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if (!nu) return;
        var h = nu.getHours();
        if (h < 12) {
          this.amPM = 'AM';
          this.hours = h === 0 ? 12 : h;
        } else {
          this.amPM = 'PM';
          this.hours = h === 12 ? 12 : h - 12;
        }
        var m = nu.getMinutes();
        this.minutes = m < 10 ? '0' + m : m;
      }
    },
    // These three values collectively form the "softData" for this view.
    // They are reconstituted into a Date on OK.
    {
      name: 'hours',
      defaultValue: 12
    },
    {
      name: 'minutes',
      defaultValue: '00'
    },
    {
      name: 'amPM',
      defaultValue: 'AM'
    },
    {
      name: 'showHours',
      defaultValue: true
    },
    {
      name: '$hand',
      getter: function() {
        return this.X.$(this.id + '-hand');
      }
    },
    {
      name: '$face',
    },
    {
      name: 'rotation',
      postSet: function(old, nu) {
        if (this.$hand) {
          this.$hand.style.transform = 'rotate(' + nu + 'deg)';
        }
      },
    },
    {
      name: 'className',
      defaultValue: 'time-picker'
    },
    {
      name: 'dragListener_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.dynamicFn(function() {
        this.hours; this.minutes; this.showHours;
      }.bind(this), function() {
        this.rotation = this.showHours ? this.hours * 30 : this.minutes * 6;
      }.bind(this));
    },
    function hourClick(i) {
      this.hours = i === 0 ? 12 : i;
      this.showHours = false;
    },
    function minuteClick(i) {
      this.minutes = i < 10 ? '0' + i : i;
    },
    function initHTML() {
      this.SUPER();
      // Tickle rotation to make sure the DOM value is updated.
      this.rotation = this.rotation;

      // Set up the drag gesture.
      this.$face = this.X.$(this.id + '-face');
      var gesture = this.GestureTarget.create({
        gesture: 'drag',
        containerID: this.id + '-face',
        handler: this
      });
      this.gestureManager.install(gesture);
      this.addDestructor(function() {
        this.gestureManager.uninstall(gesture);
        if (this.dragListener_) {
          this.dragListener_.destroy();
          this.dragListener_ = '';
        }
      }.bind(this));
    },
  ],

  listeners: [
    {
      name: 'dragStart',
      code: function(p) {
        this.dragListener_ = this.dynamicFn(function() { p.x; p.y; },
            this.dragMove.bind(this, p));
      }
    },
    {
      name: 'dragEnd',
      code: function() {
        this.dragListener_.destroy();
        this.dragListener_ = '';
        if (this.showHours) {
          this.showHours = false;
        }
      }
    },
    {
      name: 'dragMove',
      code: function(p) {
        var tx = p.x - this.$face.offsetLeft;
        var ty = p.y - this.$face.offsetTop;

        // Draw two concentric circles with radii of 135 and 90 respectively.
        // Only drag locations inside the gap between them actually cause a
        // change. In other words, compute the distance d to (135, 135) in this
        // coordinate system, and only react to 90 <= d <= 135.
        // dx and dy are coordinates relative to the center of the clock face.
        var dx = tx - 135;
        var dy = 135 - ty;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (90 <= d && d <= 135) {
          // Angle in radians, counter-clockwise from 3 o'clock.
          var angleRadCCW3 = Math.atan2(dy, dx);
          // Angle in degrees, counter-clockwise from 3 o'clock;
          var angleDegCCW3 = 360 * (angleRadCCW3 / (Math.PI * 2));
          // Angle in degrees, clockwise from 12 o'clock;
          var angleDegCW12 = 90 - angleDegCCW3;
          if (angleDegCW12 < 0) angleDegCW12 += 360;

          // Compute the nearest minute or hour to that position.
          if (this.showHours) {
            var snapped = Math.round(angleDegCW12 / 30);
            this.hours = snapped === 0 ? 12 : snapped;
          } else {
            var snapped = Math.round(angleDegCW12 / 6);
            if (snapped === 60) snapped = 0;
            if (snapped < 10) snapped = '0' + snapped;
            this.minutes = snapped;
          }
        }
      }
    },
  ],

  actions: [
    {
      name: 'ok',
      code: function() {
        // Clone the Date object.
        var d = this.data ? new Date(this.data) : new Date();
        d.setSeconds(0);
        var h = this.hours === 12 ? 0 : this.hours;
        if (this.amPM === 'PM') h += 12;
        d.setHours(h);
        d.setMinutes(+this.minutes);

        this.popup.close();
        this.data = d;
      }
    },
    {
      name: 'cancel',
      code: function() {
        this.popup.close();
      }
    },
  ],

  templates: [
    function CSS() {/*
      .time-picker {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        height: 450px;
        user-select: none;
        width: 300px;
      }
      .time-picker-header {
        align-items: center;
        background-color: #3e50b4;
        color: #fff;
        display: flex;
        flex-shrink: 0;
        font-size: 56px;
        height: 80px;
        justify-content: flex-end;
      }
      .time-picker-header-time-part {
        margin: 0 4px;
        opacity: 0.76;
      }
      .time-picker-header-time-part.time-picker-highlight {
        opacity: 1;
      }
      .time-picker-header-colon {
        opacity: 0.76;
      }
      .time-picker-half-day {
        display: flex;
        flex-direction: column;
        font-size: 20px;
        margin: 0 24px 0 18px;
      }
      .time-picker-half-day-part {
        font-weight: 500;
        opacity: 0.76;
      }
      .time-picker-half-day-part.time-picker-highlight {
        opacity: 1;
      }

      .time-picker-body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .time-picker-face {
        align-self: center;
        background-color: #e0e0e0;
        border-radius: 50%;
        height: 270px;
        margin: 20px 0;
        position: relative;
        width: 270px;
      }

      .time-picker-body-number {
        align-items: center;
        color: #000;
        display: flex;
        font-size: 16px;
        height: 20px;
        justify-content: space-around;
        position: absolute;
        width: 20px;
        z-index: 20;
      }
      <%
        var leftOffset = 10;
        var topOffset = 10;
        var outerRadius = 135;
        var innerRadius = 112;
        var angles = [90, 60, 30, 0, 330, 300, 270, 240, 210, 180, 150, 120];
        for (var i = 0; i < 12; i++) {
          var angleDeg = angles[i];
          var angleRad = (angleDeg / 360) * 2 * Math.PI;
          var y = Math.sin(angleRad) * innerRadius;
          var x = Math.cos(angleRad) * innerRadius;
          var top = outerRadius - y - topOffset;
          var left = outerRadius + x - leftOffset;
          %> .time-picker-body-number-<%= i %> {
            top: <%= top %>px;
            left: <%= left %>px;
          }
      <% } %>

      .time-picker-hand {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        z-index: 10;
      }
      .time-picker-hand-inner {
        position: relative;
        height: 100%;
        width: 100%;
      }
      .time-picker-hand-end {
        background-color: #7baaf7;
        border-radius: 50%;
        height: 40px;
        left: 115px;
        position: absolute;
        top: 3px;
        width: 40px;
      }
      .time-picker-hand-arm {
        background-color: #7baaf7;
        height: 95px;
        left: 134px;
        position: absolute;
        top: 43px;
        width: 2px;
      }
      .time-picker-hand-center {
        background-color: #4285f4;
        border-radius: 50%;
        height: 6px;
        left: 132px;
        position: absolute;
        top: 132px;
        width: 6px;
      }

      .time-picker-buttons {
        display: flex;
        justify-content: flex-end;
      }

      .hidden {
        display: none;
      }
    */},
    function toHTML() {/*
      <div id="%%id" %%cssClassAttr()>
        <div class="time-picker-header">
          <span id="%%id-hours" class="time-picker-header-time-part">
            <%# this.hours %>
          </span>
          <span class="time-picker-header-colon">:</span>
          <span id="%%id-minutes" class="time-picker-header-time-part">
            <%# this.minutes %>
          </span>
          <div class="time-picker-half-day">
            <span id="%%id-am" class="time-picker-half-day-part">AM</span>
            <span id="%%id-pm" class="time-picker-half-day-part">PM</span>
          </div>
          <%
            this.on('click', function() { self.showHours = true; },
                this.id + '-hours');
            this.on('click', function() { self.showHours = false; },
                this.id + '-minutes');
            this.on('click', function() { self.amPM = 'AM'; }, this.id + '-am');
            this.on('click', function() { self.amPM = 'PM'; }, this.id + '-pm');

            this.setClass('time-picker-highlight',
                function() { return self.showHours; }, this.id + '-hours');
            this.setClass('time-picker-highlight',
                function() { return !self.showHours; }, this.id + '-minutes');
            this.setClass('time-picker-highlight',
                function() { return self.amPM === 'AM'; }, this.id + '-am');
            this.setClass('time-picker-highlight',
                function() { return self.amPM === 'PM'; }, this.id + '-pm');
          %>
        </div>
        <div class="time-picker-body">
          <div id="%%id-face" class="time-picker-face">
            <div id="%%id-body-hours" class="time-picker-body-hours">
              <% var hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; %>
              <% for (var i = 0; i < 12; i++) { %>
                <span id="%%id-hour-<%= i %>" class="time-picker-body-number
                    time-picker-body-number-<%= i %>">
                  <%= hours[i] %>
                </span>
                <% this.on('click', this.hourClick.bind(this, i),
                    this.id + '-hour-' + i); %>
              <% } %>
            </div>
            <div id="%%id-body-minutes" class="time-picker-body-hours">
              <% var minutes = ['00', '05', '10', '15', '20', '25', '30', '35',
                     '40', '45', '50', '55']; %>
              <% for (var i = 0; i < 12; i++) { %>
                <span id="%%id-minute-<%= i %>" class="time-picker-body-number
                    time-picker-body-number-<%= i %>">
                  <%= minutes[i] %>
                </span>
                <% this.on('click', this.minuteClick.bind(this, 5 * i),
                    this.id + '-minute-' + i); %>
              <% } %>
            </div>
            <div id="%%id-hand" class="time-picker-hand">
              <div class="time-picker-hand-inner">
                <div class="time-picker-hand-end"></div>
                <div class="time-picker-hand-arm"></div>
                <div class="time-picker-hand-center"></div>
              </div>
            </div>
            <%
              this.setClass('hidden', function() { return !self.showHours; },
                  this.id + '-body-hours');
              this.setClass('hidden', function() { return self.showHours; },
                  this.id + '-body-minutes');
            %>
          </div>
          <div class="time-picker-buttons">
            $$cancel
            $$ok
          </div>
        </div>
      </div>
    */},
  ]
});
