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
  name: 'Input',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.Input',
  ],
  properties: [
    ['nodeName', 'div'],
    {
      name: 'showLabel',
      attribute: true,
      defaultValue: true
    },
    {
      name: 'label',
      attribute: true
    },
    {
      model_: 'BooleanProperty',
      name: 'focused'
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.cls(this.myCls());
      if (this.showLabel) {
        this.start('label')
            .cls2(this.myCls('label'))
            .cls2(function() {
              return (typeof self.data !== 'undefined' && self.data !== '') ||
                  self.focused ? self.myCls('label-offset') : '';
            }.on$(this.X, this.data$, this.focused$))
            .add(this.label$)
            .end();
      } else {
        this.cls2(this.myCls('no-label'));
      }

      var input = this.start('input')
          .attrs({ type: 'text' })
          .on('focus', function() { self.focused = true; })
          .on('blur', function() { self.focused = false; });
      input.data$ = this.data$;
      input.end();
    },
    function fromProperty(prop) {
      this.label = this.label || prop.label;
      return this.SUPER(prop);
    },
  ],

  templates: [
    function CSS() {/*
      $ {
        align-items: center;
        display: flex;
        margin: 8px;
        padding: 32px 8px 8px 8px;
        position: relative;
      }
      $-label {
        color: #999;
        flex-grow: 1;
        font-size: 14px;
        font-weight: 500;
        position: absolute;
        top: 32px;
        transition: font-size 0.5s, top 0.5s;
        z-index: 0;
      }
      $-label-offset {
        font-size: 85%;
        top: 8px;
      }
      $ input {
        background: transparent;
        border-bottom: 1px solid #e0e0e0;
        border-left: none;
        border-top: none;
        border-right: none;
        color: #444;
        flex-grow: 1;
        font-family: inherit;
        font-size: inherit;
        margin-bottom: -8px;
        padding: 0 0 7px 0;
        resize: none;
        z-index: 1;
      }
      $ input:focus {
        border-bottom: 2px solid #4285f4;
        padding: 0 0 6px 0;
        outline: none;
      }
    */},
  ]
});
