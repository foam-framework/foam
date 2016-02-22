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
  name: 'TimePicker',
  extends: 'foam.u2.View',
  requires: [
    'foam.input.touch.GestureTarget',
  ],
  imports: [
    'gestureManager',
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
      name: 'faceID',
      documentation: 'Needs to be fixed (relative to the outer element) so ' +
          'it can be registered with the gesture manager.',
      factory: function() {
        return this.id + '-face';
      }
    },
    {
      name: 'faceE',
    },
    {
      name: 'titleE',
      documentation: 'Element for the title section. Used by the dialog.',
      factory: function() {
        var self = this;
        var header = this.X.E().cls(this.myCls('header'));
        header.start('span')
            .cls(this.myCls('header-time-part'))
            .add(this.hours$)
            .on('click', function() { self.showHours = true; })
            .enableCls(this.myCls('highlight'), this.showHours$)
            .end();
        header.start('span').cls(this.myCls('header-colon')).add(':').end();
        header.start('span')
            .cls(this.myCls('header-time-part'))
            .add(this.minutes$)
            .on('click', function() { self.showHours = false; })
            .enableCls(this.myCls('highlight'), this.showHours$, true /* negate */)
            .end();
        header.start()
            .cls(this.myCls('half-day'))
            .start('span')
                .cls(this.myCls('half-day-part'))
                .add('AM')
                .on('click', function() { self.amPM = 'AM'; })
                .enableCls(this.myCls('highlight'), header.dynamic(function(amPM) {
                  return amPM === 'AM';
                }, this.amPM$))
                .end()
            .start('span')
                .cls(this.myCls('half-day-part'))
                .add('PM')
                .on('click', function() { self.amPM = 'PM'; })
                .enableCls(this.myCls('highlight'), header.dynamic(function(amPM) {
                  return amPM === 'PM';
                }, this.amPM$))
                .end()
            .end();

        return header;
      }
    },
    {
      name: 'bodyE',
      factory: function() {
        var body = this.X.E().cls(this.myCls('body'));
        this.faceE = body.start();
        this.faceE.cls(this.myCls('face')).end();

        var hours = this.faceE.start();
        hours.cls(this.myCls('body-hours'));
        hours.enableCls(this.myCls('hidden'), this.showHours$, true /* negate */);
        for ( var i = 0 ; i < 12 ; i++ ) {
          hours.start('span')
              .cls(this.myCls('body-number'))
              .cls(this.myCls('body-number-' + i))
              .add(i || 12)
              .on('click', this.hourClick.bind(this, i))
              .end();
        }
        hours.end();

        var minutes = this.faceE.start();
        minutes.cls(this.myCls('body-minutes'));
        minutes.enableCls(this.myCls('hidden'), this.showHours$);
        var minutesText = ['00', '05', '10', '15', '20', '25', '30', '35', '40',
            '45', '50', '55'];
        for ( var i = 0 ; i < 12 ; i++ ) {
          minutes.start('span')
              .cls(this.myCls('body-number'))
              .cls(this.myCls('body-number-' + i))
              .add(minutesText[i])
              .on('click', this.minuteClick.bind(this, 5 * i))
              .end();
        }
        minutes.end();

        this.faceE.start()
            .setID(this.faceID)
            .cls(this.myCls('hand'))
            .style({
              transform: body.dynamic(function(rot) {
                return 'rotate(' + rot + 'deg)';
              }, this.rotation$)
            })
            .start()
                .cls(this.myCls('hand-inner'))
                .start().cls(this.myCls('hand-end')).end()
                .start().cls(this.myCls('hand-arm')).end()
                .start().cls(this.myCls('hand-center')).end()
                .end()
            .end();

        body.dynamic(function(hours, minutes, showHours) {
          this.rotation = showHours ? hours * 30 : minutes * 6;
        }.bind(this), this.hours$, this.minutes$, this.showHours$);

        var gesture = this.GestureTarget.create({
          gesture: 'drag',
          containerID: this.faceE.id,
          handler: this
        });
        body.on('load', function() { this.gestureManager.install(gesture); }.bind(this));
        body.on('unload', function() { this.gestureManager.uninstall(gesture); }.bind(this));

        return body;
      }
    },
    {
      name: 'rotation',
    },
    {
      name: 'dragListener_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();

    },
    function hourClick(i) {
      this.hours = i === 0 ? 12 : i;
      this.showHours = false;
    },
    function minuteClick(i) {
      this.minutes = i < 10 ? '0' + i : i;
    },
  ],

  listeners: [
    {
      name: 'dragStart',
      code: function(p) {
        this.dragListener_ = this.dynamic(this.dragMove, p.x$, p.y$);
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
      code: function(x, y) {
        var tx = x - this.faceE.el().offsetLeft;
        var ty = y - this.faceE.el().offsetTop;

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
    function onOK() {
      // Called when the OK button is clicked by the wrapping dialog.
      // Clone the Date object.
      var d = this.data ? new Date(this.data) : new Date();
      d.setSeconds(0);
      var h = this.hours === 12 ? 0 : this.hours;
      if (this.amPM === 'PM') h += 12;
      d.setHours(h);
      d.setMinutes(+this.minutes);

      this.data = d;
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        height: 450px;
        user-select: none;
        width: 300px;
      }
      ^header {
        align-items: center;
        background-color: #3e50b4;
        color: #fff;
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        font-size: 56px;
        height: 80px;
        justify-content: flex-end;
        user-select: none;
        width: 300px;
      }
      ^header-time-part {
        margin: 0 4px;
        opacity: 0.76;
      }
      ^header-time-part^highlight {
        opacity: 1;
      }
      ^header-colon {
        opacity: 0.76;
      }
      ^half-day {
        display: flex;
        flex-direction: column;
        font-size: 20px;
        margin: 0 24px 0 18px;
      }
      ^half-day-part {
        font-weight: 500;
        opacity: 0.76;
      }
      ^half-day-part^highlight {
        opacity: 1;
      }

      ^body {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        user-select: none;
        width: 300px;
      }
      ^face {
        align-self: center;
        background-color: #e0e0e0;
        border-radius: 50%;
        height: 270px;
        margin: 20px 0;
        position: relative;
        width: 270px;
      }

      ^body-number {
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
          %> ^body-number-<%= i %> {
            top: <%= top %>px;
            left: <%= left %>px;
          }
      <% } %>

      ^hand {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        z-index: 10;
      }
      ^hand-inner {
        position: relative;
        height: 100%;
        width: 100%;
      }
      ^hand-end {
        background-color: #7baaf7;
        border-radius: 50%;
        height: 40px;
        left: 115px;
        position: absolute;
        top: 3px;
        width: 40px;
      }
      ^hand-arm {
        background-color: #7baaf7;
        height: 95px;
        left: 134px;
        position: absolute;
        top: 43px;
        width: 2px;
      }
      ^hand-center {
        background-color: #4285f4;
        border-radius: 50%;
        height: 6px;
        left: 132px;
        position: absolute;
        top: 132px;
        width: 6px;
      }

      ^buttons {
        display: flex;
        justify-content: flex-end;
      }

      ^hidden {
        display: none;
      }
    */},
  ]
});
