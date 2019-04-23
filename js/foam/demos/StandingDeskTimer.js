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
  name: 'StandingDeskTimer',
  package: 'foam.demos',
  imports: [
    'setInterval',
    'clearInterval',
  ],
  requires: [
    'foam.demos.StandingDeskTimerEnum',
  ],
  documentation: function() {/*
    An app for reminding you when to stand or sit when working at a standing
    desk.
  */},
  properties: [
    {
      type: 'Float',
      name: 'standingTime',
      defaultValue: 15,
    },
    {
      type: 'Float',
      name: 'sittingTime',
      defaultValue: 60,
    },
    {
      type: 'Float',
      defaultValue: 0,
      hidden: true,
      name: 'timeRemaining',
      postSet: function(_, n) {
        var min = parseInt(n / (60 * 1000));
        var sec = parseInt((n - (min * 60 * 1000)) / 1000);
        if (sec < 10) sec = '0' + sec;
        this.clock = min + ':' + sec;

        if (n <= 0) {
          this.whatToDo = this.whatToDo == this.StandingDeskTimerEnum.SIT ?
              this.StandingDeskTimerEnum.STAND : this.StandingDeskTimerEnum.SIT
        }
      },
      swiftPostSet: function() {/*
        let min = Int(newValue / (60))
        let sec = Int(newValue - Float((min * 60)))
        self.clock = String(format: "%i:%02i", min, sec)

        if newValue <= 0 {
          self.whatToDo = self.whatToDo == StandingDeskTimerEnum.SIT ?
              StandingDeskTimerEnum.STAND : StandingDeskTimerEnum.SIT
        }
      */},
    },
    {
      type: 'String',
      swiftView: 'FoamUILabel',
      mode: 'read-only',
      name: 'clock',
    },
    {
      type: 'Enum',
      enum: 'foam.demos.StandingDeskTimerEnum',
      label: 'What do I do?',
      name: 'whatToDo',
      defaultValue: 'STAND',
      postSet: function(_, n) {
        var newTime = n == this.StandingDeskTimerEnum.STAND ?
            this.standingTime : this.sittingTime;
        this.timeRemaining = newTime * 60 * 1000;
        alert(this.StandingDeskTimerEnum.valueForIndex(n).label);
      },
      swiftPostSet: function() {/*
        let newTime = newValue == StandingDeskTimerEnum.STAND ?
            self.standingTime : self.sittingTime;
        self.timeRemaining = newTime * 60
        print(newValue.label)
      */},
    },
    {
      type: 'Boolean',
      name: 'started',
      postSet: function(o, n) {
        if (o == n) return;
        if (n) {
          var getNow = function() { return new Date().getTime(); };
          var lastTime = getNow();
          this.timer =  this.setInterval(function() {
            var now = getNow();
            var diff = now - lastTime;
            lastTime = now;
            this.timeRemaining -= diff;
          }.bind(this), 50);
          window.onbeforeunload = function() {
            return 'You sure you want to close this?';
          };
        } else {
          this.clearInterval(this.timer);
          window.onbeforeunload = undefined;
        }
      },
      swiftPostSet: function() {/*
        if let oldValue = oldValue as? Bool {
          if oldValue == newValue { return }
        }
        if newValue {
          let getNow: () -> TimeInterval = { () in
            return NSDate().timeIntervalSince1970
          }
          var lastTime = getNow()
          self.timer = Interval.set({ () in
            let now = getNow()
            let diff = now - lastTime
            lastTime = now
            self.timeRemaining -= Float(diff)
          }, interval: 0.05)
        } else {
          if self.timer != nil {
            Interval.clear(self.timer!)
          }
        }
      */},
    },
    {
      name: 'timer',
      swiftType: 'DispatchSource?',
      swiftDefaultValue: 'nil',
      hidden: true,
    },
  ],
  actions: [
    {
      name: 'start',
      code: function() {
        this.started = true;
      },
      swiftCode: function() {/*
        started = true
      */},
    },
    {
      name: 'stop',
      code: function() {
        this.started = false;
      },
      swiftCode: function() {/*
        started = false
      */},
    },
    {
      name: 'sit',
      code: function() {
        this.whatToDo = this.StandingDeskTimerEnum.SIT;
      },
      swiftCode: function() {/*
        whatToDo = .SIT
      */},
    },
    {
      name: 'stand',
      code: function() {
        this.whatToDo = this.StandingDeskTimerEnum.STAND;
      },
      swiftCode: function() {/*
        whatToDo = .STAND
      */},
    },
  ],
});
