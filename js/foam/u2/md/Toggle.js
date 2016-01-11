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

  requires: [
    'foam.ui.md.HaloView',
  ],
  imports: [
    'dynamic',
  ],

  properties: [
    'label',
    {
      name: 'halo',
      factory: function() {
        return this.HaloView.create({
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        });
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls())
          .cls('noselect')
          .on('click', function() { self.data = !self.data; })
          .start('span').cls(this.myCls('label')).add(this.label$).end()
          .start('span').cls(this.myCls('text')).add(this.dynamic(function(data) {
            return data ? 'ON' : 'OFF';
          }, this.data$)).end()
          .start('div').cls(this.myCls('switch'))
              .start('span').cls(this.myCls('background'))
                  .enableCls(this.myCls('on'), this.data$)
                  .start('div').cls(this.myCls('lever')).end()
              .end()
              .start().cls(this.myCls('halo')).add(this.halo.toView_()).end()
          .end();
    },
    function fromProperty(prop) {
      this.label = this.label || prop.label;
      return this.SUPER(prop);
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
        flex-grow: 1;
        margin-bottom: auto;
        margin-top: auto;
        opacity: 0.54;
      }
      ^text {
        margin-bottom: auto;
        margin-right: 20px;
        margin-top: auto;
        width: 1em;
      }


      ^switch {
        height: 14px;
        position: relative;
        width: 36px;
      }

      ^background {
        background-color: #9e9e9e;
        border-radius: 7px;
        display: inline-block;
        height: 14px;
        opacity: 1;
        pointer-events: none;
        position: absolute;
        width: 36px;
      }
      ^background^on {
        background-color: #7baaf7;
      }

      ^halo {
        border-radius: 50%;
        cursor: pointer;
        height: 48px;
        left: -6px;
        position: absolute;
        top: -17px;
        width: 48px;
        z-index: 2;
      }

      ^lever {
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
      ^on ^lever {
        background-color: #3367d6;
        border: none;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.26);
        left: 16px;
      }
    */},
  ]
});
