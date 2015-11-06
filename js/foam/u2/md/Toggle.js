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
  name: 'Toggle',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'label',
      defaultValueFn: function() { return this.prop.label; }
    },
    {
      name: 'prop',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.cls('foam-u2-md-Toggle')
          .on('click', function() { self.data = !self.data; })
          .start('span').cls('foam-u2-md-Toggle-label').cls('noselect').add(this.label$).end()
          .start('span').cls('foam-u2-md-Toggle-text').add(function() {
            return self.data ? 'ON' : 'OFF';
          }.on$(this.X, this.data$)).end()
          .start('div').cls('foam-u2-md-Toggle-switch')
              .start('span').cls('foam-u2-md-Toggle-background')
                  .cls2(function() { return self.data ? 'foam-u2-md-Toggle-on' : ''; }.on$(this.X, this.data$))
                  .start('div').cls('foam-u2-md-Toggle-lever').end()
              .end()
          .end();
    },
  ],

  templates: [
    function CSS() {/*
      .foam-u2-md-Toggle {
        align-items: center;
        display: flex;
        margin: 8px;
        padding: 8px;
      }
      .foam-u2-md-Toggle-label {
        flex-grow: 1;
        margin-bottom: auto;
        margin-top: auto;
        opacity: 0.54;
      }
      .foam-u2-md-Toggle-text {
        margin-bottom: auto;
        margin-right: 20px;
        margin-top: auto;
        width: 1em;
      }


      .foam-u2-md-Toggle-switch {
        height: 14px;
        position: relative;
        width: 36px;
      }

      .foam-u2-md-Toggle-background {
        background-color: #9e9e9e;
        border-radius: 7px;
        display: inline-block;
        height: 14px;
        opacity: 1;
        pointer-events: none;
        position: absolute;
        width: 36px;
      }
      .foam-u2-md-Toggle-background.foam-u2-md-Toggle-on {
        background-color: #7baaf7;
      }

      .foam-u2-md-Toggle-lever {
        background-color: #f5f5f5;
        border-radius: 50%;
        border: 1px solid #ccc;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.15);
        height: 20px;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: -3px;
        transition: left .08s;
        width: 20px;
      }
      .foam-u2-md-Toggle-on .foam-u2-md-Toggle-lever {
        background-color: #3367d6;
        border: none;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.26);
        left: 16px;
      }

    */},
  ]
});
