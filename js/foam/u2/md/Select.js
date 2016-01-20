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

  properties: [
    {
      type: 'Boolean',
      name: 'inline',
      defaultValue: false,
      attribute: true,
    },
    {
      type: 'Boolean',
      name: 'showLabel',
      attribute: true,
      defaultValueFn: function() {
        return !this.inline;
      }
    },
  ],

  listeners: [
    {
      name: 'onClick',
      isFramed: true,
      code: function() {
        if ( this.mode !== 'rw' ) return;
        // Blur any active input element.
        var active = this.document.activeElement;
        if (active) active.blur();

        var self = this;
        var popup = this.PopupMenu.create({
          data$: this.data$,
          choices: this.choices,
          autoSetData: this.autoSetData
        });
        popup.open(this.index, this.el());
      }
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: flex-end;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 8px 16px;
        padding: 8px 0;
        position: relative;
      }
      ^.show-label {
        margin-top: 24px;
      }

      ^label {
        color: #999;
        display: none;
        flex-grow: 1;
        font-size: 85%;
        font-weight: 500;
        position: absolute;
        top: -8px;
        z-index: 0;
      }
      ^.show-label ^label {
        display: block;
      }

      ^value {
        flex-grow: 1;
      }

      ^down-arrow {
        fill: #999;
        height: 12px;
        margin: 8px 8px 2px 16px;
        width: 12px;
      }
    */},
    function initE() {/*#U2
      <div class="^" class.show-label={{this.showLabel$}} onClick="onClick">
        <label class="^label">{{this.label$}}</label>
        <div class="^value">{{this.text$}}</div>
        <svg class="^down-arrow" width="12px" height="12px" viewBox="0 0 48 48">
          <g><path d="M0 16 l24 24 24 -24 z"></path></g>
        </svg>
      </div>
    */},
  ]
});
