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
  name: 'Stepper',
  extends: 'foam.u2.View',
  requires: [
    'foam.ui.md.HaloView',
  ],

  properties: [
    {
      name: 'data',
      defaultValue: 0
    },
    {
      type: 'Array',
      name: 'steps',
      documentation: 'Array of step objects, indexed by $$DOC{ref:".data"}. Steps have a label, and may set optional: true.',
      required: true,
    }
  ],

  methods: [
    function initE() {
      this.cls(this.myCls());
      for (var i = 0; i < this.steps.length; i++) {
        var step = this.start()
            .cls(this.myCls('step'))
            .enableCls(this.myCls('enabled'), this.dynamic(function(i, s) {
              return s === i;
            }.bind(this, i), this.data$))
            .start()
                .cls(this.myCls('step-circle'))
                .cls('foam-u2-md-colors-bright-bg')
                .add('' + (i + 1))
                .end()
            .on('click', this.onClick.bind(this, i));

        var label = this.E().cls(this.myCls('step-label-container')).start()
            .cls(this.myCls('step-label')).add(this.steps[i].label).end();

        if (this.steps[i].optional) {
          label.start().cls(this.myCls('step-label-optional')).add('Optional').end();
        }
        step.add(label);

        // Add spacers unless this is the last step.
        if ( i + 1 < this.steps.length ) {
          this.start().cls(this.myCls('spacer')).end();
        }
      }
    },
  ],

  listeners: [
    function onClick(i) {
      this.data = i;
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        background-color: #fff;
        display: flex;
        padding: 0 16px;
      }
      ^step {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        height: 72px;
      }
      ^step-circle {
        align-items: center;
        border-radius: 50%;
        display: flex;
        font-size: 12px;
        justify-content: space-around;
        height: 24px;
        margin: 8px 0 8px 8px;
        width: 24px;
      }
      ^step:not(^enabled) ^step-circle {
        background-color: #9e9e9e;
      }
      ^step-label-container {
        align-items: flex-start;
        display: flex;
        flex-direction: column;
        padding: 8px;
      }
      ^step-label {
        font-size: 14px;
        white-space: nowrap;
      }
      ^step-label-optional {
        font-size: 12px;
        opacity: 0.54;
      }
      ^enabled ^step-label {
        font-weight: bold;
      }
      ^spacer {
        background-color: #e0e0e0;
        flex-grow: 1;
        height: 1px;
      }
    */},
  ]
});
