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
  extends: 'foam.ui.View',
  properties: [
    {
      name: 'progress',
      label: 'Elapsed Time',
      view: 'foam.ui.ProgressView'
    },
    {
      name: 'elapsedTime',
      units: 's',
      label: '',
      mode: 'read-only',
      defaultValue: 0
    },
    {
      type: 'Int',
      name: 'duration',
      units: 'ms',
      view: { factory_: 'foam.ui.RangeView', maxValue: 10000 },
      defaultValue: 5000
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
      this.X.dynamicFn(function() {
        this.progress = this.duration ? 100 * Math.min(1, 1000 * this.elapsedTime / this.duration) : 100;
      }.bind(this));
      this.duration$.addListener(this.tick);
      this.tick();
    }
  ],
  actions: [
    {
      name: 'reset',
      code: function() {
        this.elapsedTime = this.lastTick_ = 0;
        this.tick();
      }
    }
  ],
  templates: [
    function CSS() {/*
      .timer { padding: 10px !important; font-size: 18px; }
      .timer .elapsed { margin-top: 10px; }
      .timer .label { display: inline-block; width: 130px; }
      .timer button { width: 332px !important; margin-top: 16px !important; }
      .timer input { margin-left: 12px; }
      .timer input[name="duration"] { width: 182px; }
      .timer row { display: block; height: 30px; }
    */},
    function toHTML() {/*
      <div class="timer">
        <row><span class="label">Elapsed Time:</span> $$progress{width: 50}</row>
        <row class="elapsed">$$elapsedTime{model_: 'foam.ui.FloatFieldView', precision: 1, mode: 'read-only'}s</row>
        <row><span class="label">Duration:</span> $$duration{onKeyMode: true}</row>
        $$reset
      </div>
    */}
  ],
  listeners: [
    {
      name: 'tick',
      isFramed: true,
      code: function() {
        if ( 1000 * this.elapsedTime >= this.duration ) return;
        var now = Date.now();
        if ( this.lastTick_ ) this.elapsedTime += (now - this.lastTick_)/1000;
        this.elapsedTime = Math.min(this.duration/1000, this.elapsedTime);
        this.lastTick_ = now;
        this.tick();
      }
    }
  ]
});
