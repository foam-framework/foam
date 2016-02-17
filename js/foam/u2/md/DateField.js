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
  name: 'DateField',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.EasyDialog',
    'foam.u2.md.DatePicker',
  ],

  imports: [
    'document',
  ],

  properties: [
    ['nodeName', 'div'],
    {
      name: 'data',
      postSet: function(old, nu) {
        this.realData = nu;
      },
    },
    {
      type: 'Date',
      name: 'realData',
      lazyFactory: function() {
        return new Date();
      }
    },
    {
      name: 'showLabel',
      attribute: true,
      defaultValueFn: function() {
        return ! this.inline;
      }
    },
    {
      type: 'Boolean',
      name: 'inline',
      attribute: true,
      defaultValue: false
    },
    {
      name: 'label',
      attribute: true
    },
    {
      name: 'placeholder',
      attribute: true,
      documentation: 'Ignored when $$DOC{ref:".showLabel"} is true, but used ' +
          'as an inline placeholder when it\'s false.',
      defaultValueFn: function() { return this.label; }
    },
    'dialog_',
    'datePicker_',
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls());
      if (this.showLabel) {
        this.start('label')
            .cls(this.myCls('label'))
            .cls(this.dynamic(function(data, focused) {
              return (typeof data !== 'undefined' && data !== '') ||
                  focused ? self.myCls('label-offset') : '';
            }, this.realData$, this.focused_$))
            .add(this.label$)
            .end();
      } else {
        this.cls(this.myCls('no-label'));
      }

      this.inputE();
    },
    function inputE() {
      var self = this;
      var input = this.start('span')
          .cls(this.myCls('inner'))
          .on('click', this.onDateClick);

      input.add(this.dynamic(function(data, placeholder, showLabel) {
        return data ? data.toLocaleDateString() :
            (placeholder && !showLabel ?
                placeholder : this.Entity.create({ name: 'nbsp' }));
      }.bind(this), this.realData$, this.placeholder$, this.showLabel$));

      input.end();
    },
    function fromProperty(prop) {
      this.label = this.label || prop.label;
      return this.SUPER(prop);
    }
  ],

  listeners: [
    function onDateClick() {
      // Make sure to blur the active element, whatever it is.
      // Hides the keyboard on mobile.
      var active = this.document.activeElement;
      if (active) active.blur();
      this.datePicker_ = this.DatePicker.create({ data$: this.realData$ });
      this.dialog_ = this.EasyDialog.create({
        title: this.datePicker_.titleE,
        body: this.datePicker_.bodyE,
        padding: false,
        onConfirm: function() {
          this.data = this.datePicker_.softData;
          this.datePicker_ = null;
          this.dialog_ = null;
        }.bind(this)
      });
      this.dialog_.open();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        display: flex;
        margin: 8px;
        padding: 32px 8px 8px 8px;
        position: relative;
      }
      ^label {
        color: #999;
        flex-grow: 1;
        font-size: 14px;
        font-weight: 500;
        position: absolute;
        top: 32px;
        transition: font-size 0.5s, top 0.5s;
        z-index: 0;
      }
      ^label-offset {
        font-size: 85%;
        top: 8px;
      }
      ^no-label {
        padding-top: 8px;
      }
      ^inner {
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
    */}
  ]
});
