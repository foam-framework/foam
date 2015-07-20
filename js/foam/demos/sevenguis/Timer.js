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

MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Timer',
  properties: [
    {
      name: 'elapsedTime',
      defaultValue: 0
    },
    {
      name: 'duration',
      units: 'ms',
      defaultValue: 10000,
    },
    {
      name: 'progress',
      mode: 'read-only'
    },
    {
      name: 'lastTick_',
      hidden: true,
      defaultValue: 0
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.X.dynamic(function() { this.progress = Math.min(1, this.elapsedTime / this.duration);  }.bind(this));
      this.tick();
    }
  ],
  actions: [
    {
      name: 'reset',
      action: function() {
        this.elapsedTime = this.lastTick_ = 0;
        this.tick();
      }
    }
  ],
  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( this.elapsedTime >= this.duration ) return;
        var now = Date.now();
        if ( this.lastTick_ ) this.elapsedTime += now - this.lastTick_;
        this.lastTick_ = now;
        this.tick();
      }
    }
  ]
});
