/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder',
  name: 'TOSView',
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.CheckboxView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.TextFieldView',
  ],
  imports: [
    'popup',
  ],

  properties: [
    'data',
  ],


  actions: [
    {
      name: 'accept',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAJ1BMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfTHmrhGAAAADHRSTlMAKlT7gAWqUVj6UlNPDCTdAAAAO0lEQVQY02NgoBpgROYoOyDYTDZIHOUjJEiwpiNJcJxcgKTDxwpJB8vhTUhG+RgjGcVyBskOBhdqeRYAA6EM6OizgiUAAAAASUVORK5CYII=',
      ligature: 'done',
      isEnabled: function() { return this.data.accepted; },
      code: function() { this.popup.close(); },
    },
  ],

  templates: [
    function toHTML() {/*
      <tos-popup id="%%id" <%= this.cssClassAttr() %>>
        <tos-content>
          <tos>$$tos{
            model_: 'foam.ui.md.TextFieldView',
            mode: 'read-only',
            growable: true,
          }</tos>
          <tos-form>
            $$accepted{ model_: 'foam.ui.md.CheckboxView' }
          </tos-form>
          <tos-actions>
            $$accept{ model_: 'foam.ui.md.FlatButton' }
          </tos-actions>
        </tos-content>
      </tos-popup>
    */},
    function CSS() {/*
      tos-popup {
        display: block;
      }
      tos-popup tos-content, tos-popup tos-content tos, tos-popup tos-content tos-form, tos-popup tos-content tos-actions {
        display: flex;
      }
      tos-popup tos-content {
        flex-direction: column;
      }
      tos-popup tos-content tos {
        flex-grow: 1;
        overflow: auto;
      }
      tos-popup tos-content tos-actions, tos-popup tos-content tos-form {
        flex-grow: 0;
      }
      tos-popup tos-content tos-actions {
        justify-content: flex-end;
      }
      tos-popup tos-content tos .md-text-field-container {
        flex-grow: 1;
      }
      tos-popup tos-content tos label.md-text-field-label {
        font-weight: bold;
        font-size: 120%;
      }
      tos-popup tos-content tos .md-text-field-input {
        white-space: pre-wrap;
      }
    */},
  ]
});
