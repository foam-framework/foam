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
   "name": "BusyFlagTracker",

   "properties": [
      {
         model_: "Property",
         "name": "busyStatus"
      },
      {
         model_: "Property",
         "name": "target",
         "postSet": function (oldTarget, newTarget) {
        if ( this.callback ) {
          this.callback();
          this.callback = null;
        }

        if ( oldTarget ) oldTarget.remoteListener(this.onChange);
        newTarget.addListener(this.onChange);
      }
      },
      {
         model_: "Property",
         "name": "callback"
      }
   ],
   "listeners": [
      {
         model_: "Method",
         "name": "onChange",
         "code": function (_, __, oldValue, newValue) {
        if ( newValue ) {
          if ( this.callback ) this.callback();
          this.callback = this.busyStatus.start();
        } else {
          this.callback();
          this.callback = null;
        }
      },
         "args": []
      }
   ]
});
