/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'BusyStatus',
  documentation: '<p>Sets an output property to true when any "process" is ' +
      'active. Any code that needs to indicate a busy state can call ' +
      '$$DOC{ref:".start"}, which returns a completion function. When the ' +
      'long-running process is finished, call the completion function.</p>' +
      '<p>This will set $$DOC{ref:".busy"} to true when these rules ' +
      'are met: <ul>' +
      '<li>At least one process has been created.</li>' +
      '<li>The $$DOC{ref:".minPreSpinnerWait"} timer has expired.</li>' +
      '</ul> and will set it back to false when the rules are met: <ul>' +
      '<li>All processes have been completed.</li>' +
      '<li>The $$DOC{ref:".minSpinnerShowTime"} has elapsed.</li>' +
      '</ul></p>',

  imports: [
    'clearTimeout',
    'setTimeout'
  ],

  properties: [
    {
      name: 'busy',
      documentation: 'Set when the logic indicates a spinner should be shown.',
      defaultValue: false
    },
    {
      name: 'minPreSpinnerWait',
      documentation: 'Minimum wait time before showing a spinner.',
      units: 'ms',
      defaultValue: 500
    },
    {
      name: 'minSpinnerShowTime',
      documentation: 'Minimum time to show a spinner. (Seems strange, but it ' +
          'is perceived as glitchy to see a spinner for only an instant.)',
      units: 'ms',
      defaultValue: 500
    },
    // Internal below here.
    {
      name: 'waiting_',
      hidden: true,
      getter: function() { return Object.keys(this.processes_).length > 0; }
    },
    {
      name: 'processes_',
      factory: function() { return {}; }
    },
    {
      name: 'nextProcessId_',
      defaultValue: 0
    },
    {
      name: 'timer_'
    }
  ],

  methods: {
    start: function() {
      var alreadyWaiting = this.waiting_;
      var pid = this.nextProcessId_++;
      this.processes_[pid] = true;

      var completeFunc = this.done_.bind(this, pid);

      // If there were already things waiting, nothing more to do.
      if ( alreadyWaiting ) return completeFunc;

      // But if this is the first topic, we start the pre-spinner timer.
      // Clear the minimum spinner timer if it's already running.
      if ( this.timer_ ) this.clearTimeout(this.timer_);
      this.timer_ = this.setTimeout(this.onTimer, this.minPreSpinnerWait);
      return completeFunc;
    },
    done_: function(pid) {
      if ( ! this.processes_[pid] ) return; // Unrecognized topic; bail.
      delete this.processes_[pid];

      // If there are still things waiting, do nothing further.
      if ( this.waiting_ ) return;

      if ( this.timer_ && ! this.busy ) {
        // Pre-spinner timer is still running. Cancel it and we're done.
        this.clearTimeout(this.timer_);
        this.timer_ = '';
      } else if ( this.busy ) {
        // Spinner is up, and the minimum spinner timer has expired.
        this.busy = false;
      }
      // The final case is that the minimum spinner timer is still running,
      // in which case we just let it expire.
    }
  },

  listeners: [
    {
      name: 'onTimer',
      code: function() {
        var waiting = this.waiting_;
        this.timer_ = '';
        if ( this.busy && ! waiting ) {
          // Minimum spinner timer just expired, and we're done waiting.
          this.busy = false;
        } else if ( ! this.busy && waiting ) {
          // Topics are waiting and we're not already busy., so this is the
          // pre-spinner timer that just expired. Set busy.
          this.busy = true;
        }
        // Otherwise, either:
        // - The minimum spinner time expired and things are still waiting, or
        // - The pre-spinner timer just expired but the wait is already over.
        // Either way, nothing to do.
      }
    }
  ]
});

CLASS({
  name: 'BusyFlagTracker',
  properties: [
    'busyStatus',
    {
      name: 'target',
      postSet: function(oldTarget, newTarget) {
        if ( this.callback ) {
          this.callback();
          this.callback = null;
        }

        if ( oldTarget ) oldTarget.remoteListener(this.onChange);
        newTarget.addListener(this.onChange);
      }
    },
    'callback'
  ],
  listeners: [
    {
      name: 'onChange',
      code: function(_, _, oldValue, newValue) {
        if ( newValue ) {
          if ( this.callback ) this.callback();
          this.callback = this.busyStatus.start();
        } else {
          this.callback();
          this.callback = null;
        }
      }
    }
  ]
});
