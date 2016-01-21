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
  package: 'foam.u2.md',
  name: 'Checkbox',
  extends: 'foam.u2.View',

  imports: [
    'dynamic',
  ],

  properties: [
    {
      type: 'String',
      name: 'label',
      attribute: true
    },
    {
      type: 'Boolean',
      name: 'showLabel',
      attribute: true,
      defaultValue: true
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls())
          .enableCls(this.myCls('checked'), this.data$)
          .cls(this.dynamic(function(mode) {
            return mode === 'rw' ? undefined : self.myCls('read-only');
          }, this.mode$))
          .on('click', function() { if (self.mode === 'rw') self.data = !self.data; });
      if (this.showLabel) {
        this.start('span')
            .cls(this.myCls('label')).cls('noselect')
            .add(this.label$)
            .end();
      }
      this.start('div').cls(this.myCls('box-outer')).cls('noselect')
              .start('div').cls(this.myCls('box'))
                  .add(this.svgElement()).end()
              // TODO(braden): Halo support.
          .end();
    },
    function fromProperty(prop) {
      this.SUPER(prop);
      this.label = this.label || prop.label;
    },
    function svgElement() {
      var self = this;
      return this.E('svg').attrs({ viewBox: '0 0 48 48' })
          .start('path').attrs({ d: 'M0 0h48v48H0z', fill: 'none' }).end()
          .start('path').attrs({
            d: 'M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z',
          }).end();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        display: flex;
        margin: 8px;
        padding: 8px;
      }
      ^label {
        color: #444;
        flex-grow: 1;
        margin-right: 12px;
        overflow: hidden;
        white-space: nowrap;
      }
      ^read-only {
        opacity: 0.54;
      }
      ^box-outer {
        height: 18px;
        position: relative;
        width: 18px;
      }
      ^box {
        border-radius: 2px;
        border: solid 2px #5a5a5a;
        box-sizing: border-box;
        display: inline-block;
        fill: rgba(0, 0, 0, 0);
        height: 18px;
        opacity: 1;
        pointer-events: none;
        position: absolute;
        transition: background-color 140ms, border-color 140ms;
        width: 18px;
      }
      ^checked ^box {
        background-color: #04a9f4;
        border-color: #04a9f4;
        fill: white;
      }
      ^read-only^checked ^box {
        background-color: #5a5a5a;
        border-color: #5a5a5a;
      }
    */}
  ]
});
