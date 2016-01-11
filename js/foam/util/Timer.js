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
  package: 'foam.util',
  name: 'Timer',

  properties: [
    {
      type: 'Int',
      name:  'interval',
      help:  'Interval of time between updating time.',
      units: 'ms',
      defaultValue: 10
    },
    {
      type: 'Int',
      name:  'i',
      defaultValue: 0
    },
    {
      type: 'Float',
      name:  'timeWarp',
      defaultValue: 1.0
    },
    {
      type: 'Int',
      name:  'duration',
      units: 'ms',
      defaultValue: -1
    },
    {
      type: 'Float',
      name: 'percent',
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'startTime',
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'time',
      help:  'The current time in milliseconds since epoch.',
      preSet: function(_, t) { return Math.ceil(t); },
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'second',
      help:  'The second of the current minute.',
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'minute',
      help:  'The minute of the current hour.',
      defaultValue: 0
    },
    {
      type: 'Int',
      name:  'hour',
      help:  'The hour of the current day.',
      defaultValue: 0
    },
    {
      name: 'isStarted',
      defaultValue: false,
      hidden: true
    }
  ],

  actions: [
    {
      name:  'start',
      help:  'Start the timer.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return ! this.isStarted; },
      code:        function() { this.isStarted = true; this.tick(); }
    },
    {
      name:  'step',
      help:  'Step the timer.',

      isAvailable: function() { return true; },
      code: function()      {
        this.i++;
        this.time  += this.interval * this.timeWarp;
        this.second = this.time /    1000 % 60 << 0;
        this.minute = this.time /   60000 % 60 << 0;
        this.hour   = this.time / 3600000 % 24 << 0;
      }
    },
    {
      name:  'stop',
      help:  'Stop the timer.',

      isAvailable: function() { return true; },
      isEnabled: function() { return this.isStarted; },
      code: function() {
        this.isStarted = false;
        if ( this.timeout ) {
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.tick();
    },
  ],
  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function(e) {
        this.timeout = undefined;
        if ( ! this.isStarted ) return;

        var prevTime = this.startTime_ || 0;
        this.startTime_ = Date.now();
        this.interval = Math.min(100, this.startTime_ - prevTime);
        this.step();
        this.tick();
      }
    }
  ]
});
