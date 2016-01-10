/*
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
   "package": "foam.util.busy",
   "name": "BusyStatus",

   "imports": [
      "clearTimeout",
      "setTimeout"
   ],
   "properties": [
      {
         model_: "Property",
         "name": "busy",
         "defaultValue": false
      },
      {
         model_: "Property",
         "name": "minPreSpinnerWait",
         "units": "ms",
         "defaultValue": 500
      },
      {
         model_: "Property",
         "name": "minSpinnerShowTime",
         "units": "ms",
         "defaultValue": 500
      },
      {
         model_: "Property",
         "name": "waiting_",
         "hidden": true,
         "getter": function () { return Object.keys(this.processes_).length > 0; }
      },
      {
         model_: "Property",
         "name": "processes_",
         "factory": function () { return {}; }
      },
      {
         model_: "Property",
         "name": "nextProcessId_",
         "defaultValue": 0
      },
      {
         model_: "Property",
         "name": "timer_"
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "start",
         "code": function () {
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
         "args": []
      },
      {
         model_: "Method",
         "name": "done_",
         "code": function (pid) {
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
    },
         "args": []
      }
   ],
   "listeners": [
      {
         model_: "Method",
         "name": "onTimer",
         "code": function () {
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
      },
         "args": []
      }
   ],
});
