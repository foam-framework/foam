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
  name: 'PolymerActionButton',
  extends: 'foam.ui.polymer.ActionButton',

  templates: [
    {
      name: 'CSS',
      todo: multiline(function() {/*
        This template can go away (and just use ActionButton's template) once
        the more specific stuff gets pushed into Calc.js.
      */}),
      template: function CSS() {/*
        paper-button.polymerActionButton {
          background-color: rgba(0, 0, 0, 0);
          min-width: initial;
          margin: initial;
          flex-grow: 1;
          justify-content: center;
          display: flex;
        }

        paper-button.polymerActionButton::shadow #ripple {
          color: rgb(241, 250, 65);
        }

        div.button {
          flex: 1;
          align-items: stretch;
          margin: 1px;
        }

        div.button-column {
          padding-top: 7px;
          padding-bottom: 10px;
        }

        div.button [role=button] {
          cursor: pointer;
        }

        div.secondaryButtons [role=button] {
          text-transform: initial;
        }

        div.tertiaryButtons [role=button] {
          text-transform: initial;
        }
      */}
    }
  ]
});

getCalcButton = function() {
  return PolymerActionButton.xbind({
    color:      'white',
    font:       '300 28px RobotoDraft',
    role:       'button'
  });
};
