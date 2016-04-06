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
  documentation: function() {/*
    An app for reminding you when to stand or sit when working at a standing
    desk.
  */},
  properties: [
    {
      type: 'Float',
      name: 'standingTime',
      swiftView: 'FoamFloatUITextField',
      defaultValue: 15,
    },
    {
      type: 'Float',
      swiftView: 'FoamFloatUITextField',
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
          this.shouldStand = !this.shouldStand;
          var newTime = this.shouldStand ? this.standingTime : this.sittingTime;
          this.timeRemaining = newTime * 60 * 1000;
          alert(this.whatToDo);
        }
      },
      swiftPostSet: function() {/*
        let min = Int(newValue / (60))
        let sec = Int(newValue - Float((min * 60)))
        self.clock = String(format: "%i:%02i", min, sec)

        if newValue <= 0 {
          self.shouldStand = !self.shouldStand
          let newTime = self.shouldStand ? self.standingTime : self.sittingTime
          self.timeRemaining = newTime * 60
          NSLog(self.whatToDo)
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
      type: 'Boolean',
      hidden: true,
      name: 'shouldStand',
      defaultValue: false,
      postSet: function(_, n) {
        this.whatToDo = n ? 'Stand' : 'Sit';
      },
      swiftPostSet: function() {/*
        self.whatToDo = newValue ? "Stand" : "Sit";
      */},
    },
    {
      type: 'String',
      swiftView: 'FoamUILabel',
      mode: 'read-only',
      label: 'What do I do?',
      name: 'whatToDo',
    },
    {
      name: 'timer',
      swiftType: 'dispatch_source_t?',
      swiftDefaultValue: 'nil',
      hidden: true,
    },
  ],
  actions: [
    {
      name: 'start',
      code: function() {
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
      },
      swiftCode: function() {/*
        let getNow: () -> NSTimeInterval = { () in
          return NSDate().timeIntervalSince1970
        }
        var lastTime = getNow()
        self.timer = Interval.set({ () in
          let now = getNow()
          let diff = now - lastTime
          lastTime = now
          self.timeRemaining -= Float(diff)
        }, interval: 0.05)
      */},
    },
    {
      name: 'stop',
      code: function() {
        this.clearInterval(this.timer);
        window.onbeforeunload = undefined;
      },
      swiftCode: function() {/*
        if timer != nil {
          Interval.clear(timer!)
        }
      */},
    },
    {
      name: 'sit',
      code: function() {
        this.shouldStand = true;
        this.timeRemaining = 0;
      },
      swiftCode: function() {/*
        shouldStand = true;
        timeRemaining = 0;
      */},
    },
    {
      name: 'stand',
      code: function() {
        this.shouldStand = false;
        this.timeRemaining = 0;
      },
      swiftCode: function() {/*
        shouldStand = false;
        timeRemaining = 0;
      */},
    },
  ],
});
