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
  package: 'foam.u2',
  name: 'EasyDialog',
  extends: 'foam.u2.ModalOverlay',
  requires: [
    'foam.u2.Dialog',
  ],

  constants: {
    CSS_CLASS: 'foam-u2-ModalOverlay',
  },

  documentation: function() {/*
    <p>A helper for building popup dialogs of the usual flavours.</p>
    <p>Supports several different flavours of popups:
      <ul>
      <li>Provide $$DOC{ref:".body"} as a string or $$DOC{ref:"foam.u2.Element"}
        to get a simple alert()-style popup with an OK button that closes the
        dialog.
        <ul>
        <li>Add $$DOC{ref:".title"} (string or Element) to add a (MD-styled) title
          bar.</li>
        <li>Add $$DOC{ref:".confirmLabel"} to customize the default "OK" button.</li>
        </ul>
      </li>
      <li>Provide a function as $$DOC{ref:".onConfirm"} to get a two-button
        OK/Cancel dialog. The cancel button closes the dialog, the confirm
        button calls your $$DOC{ref:".onConfirm"} function.
        <ul>
          <li>Set $$DOC{ref:".confirmLabel"} to customize the OK button.</li>
          <li>Set $$DOC{ref:".cancelLabel"} to customize the Cancel button.</li>
        </ul>
      </li>
      <li>Provide your own $$DOC{ref:".buttons"} in the same format as
        $$DOC{ref:"foam.u2.Dialog.buttons"} to fully customize the dialog.</li>
      </ul>
    </p>
  */},

  properties: [
    {
      type: 'String',
      name: 'confirmLabel',
      defaultValue: 'OK',
    },
    {
      type: 'String',
      name: 'cancelLabel',
      defaultValue: 'Cancel',
    },
    {
      name: 'title',
      documentation: 'Optional title bar for the dialog. String or Element.',
    },
    {
      name: 'body',
      documentation: 'Body text for the dialog. String or Element.',
    },
    {
      type: 'Function',
      name: 'onConfirm',
      documentation: 'Will be called on an OK-button click. When set, the ' +
          'dialog has two buttons. When not set (the default), only one ' +
          'button, which has the $$DOC{ref:".confirmLabel"} ("OK") and ' +
          'closes the dialog.',
      defaultValue: null,
    },
    {
      name: 'buttons',
      documentation: 'Usually gets constructed automatically based on the ' +
          'above configuration, but you can set this manually to get fully ' +
          'custom dialog behavior.',
      lazyFactory: function() {
        // Two buttons when onConfirm is provided, one otherwise.
        if (this.onConfirm) {
          return [
            [function() {
              this.close();
              this.onConfirm();
            }.bind(this), this.confirmLabel],
            [this.close.bind(this), this.cancelLabel]
          ];
        } else {
          return [[this.close.bind(this), this.confirmLabel]];
        }
      }
    },
    {
      type: 'Boolean',
      name: 'padding',
      documentation: 'Controls the padding inside the dialog.',
      attribute: true,
      defaultValue: true
    },
    {
      name: 'dialog_',
      factory: function() {
        return this.Dialog.create({
          title: this.title,
          body: this.body,
          buttons: this.buttons,
          padding: this.padding
        });
      }
    },
  ],

  methods: [
    function open() {
      this.add(this.dialog_);
      this.SUPER();
    },
  ]
});
