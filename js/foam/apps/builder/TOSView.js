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
  extends: 'foam.ui.SimpleView',

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
          <tos-heading class="md-card-heading">
            <span class="md-headline">Terms of Service</span>
          </tos-heading>
          <div class="md-card-heading-content-spacer"></div>
          <tos class="md-card-content">
            <span class="tos">{{this.data.tos}}</span>
            $$accepted{
              model_: 'foam.ui.md.CheckboxView',
              extraClassName: 'accept',
            }
          </tos>
          <actions class="md-actions md-card-footer horizontal">
            $$accept{
              model_: 'foam.ui.md.FlatButton',
              displayMode: 'LABEL_ONLY',
            }
          </actions>
        </tos-content>
      </tos-popup>
    */},
    function CSS() {/*
      tos-popup {
        display: block;
      }
      tos-popup tos-content {
        display: flex;
      }
      tos-popup tos-heading {
        display: block;
        flex-grow: 0;
        flex-shrink: 0;
      }
      tos-popup tos-content {
        flex-direction: column;
      }
      tos-popup tos-content tos {
        display: block;
        flex-grow: 1;
        overflow: auto;
      }
      tos-popup tos-content tos .tos {
        white-space: pre-line;
      }
    */},
  ]
});
