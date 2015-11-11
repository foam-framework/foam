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
  name: 'Select',
  extends: 'foam.u2.View',
  traits: ['foam.u2.ChoiceViewTrait'],

  requires: [
    'foam.u2.md.PopupMenu',
  ],
  imports: [
    'document',
  ],

  methods: [
    function init() {
      this.SUPER();

      this.cls('foam-u2-md-Select')
          .on('click', this.onClick);

      this.start('label').cls('foam-u2-md-Select-label').add(this.label$).end();
      this.start().cls('foam-u2-md-Select-value').add(this.text$).end();
      this.start('svg')
          .cls('foam-u2-md-Select-down-arrow')
          .attrs({ width: '12px', height: '12px', viewBox: '0 0 48 48' })
          .start('g')
              .start('path').attrs({ d: 'M0 16 l24 24 24 -24 z' }).end()
          .end()
      .end();
    },
  ],

  listeners: [
    {
      name: 'onClick',
      isFramed: true,
      code: function() {
        // Blur any active input element.
        var active = this.document.activeElement;
        if (active) active.blur();

        var self = this;
        var popup = this.PopupMenu.create({
          data$: this.data$,
          choices: this.choices,
          autoSetData: this.autoSetData
        });
        popup.open(this.index, this.id$el);
      }
    },
  ],

  templates: [
    function CSS() {/*
      .foam-u2-md-Select {
        align-items: flex-end;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 24px 16px 8px;
        padding: 8px 0;
        position: relative;
      }

      .foam-u2-md-Select-label {
        color: #999;
        flex-grow: 1;
        font-size: 85%;
        font-weight: 500;
        position: absolute;
        top: -8px;
        z-index: 0;
      }

      .foam-u2-md-Select-value {
        flex-grow: 1;
      }

      .foam-u2-md-Select-down-arrow {
        fill: #999;
        height: 12px;
        margin: 8px 8px 2px 16px;
        width: 12px;
      }
    */},
  ]
});
