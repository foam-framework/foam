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
  extendsModel: 'ActionButton',
  traits: ['foam.ui.polymer.gen.PaperButton'],
  properties: [
    {
      name: 'className',
      defaultValue: 'polymer-action-button'
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.content$ = this.label$;
    }
  },

  templates: [
    function CSS() {/*
      paper-button.polymer-action-button {
        color: 'white',
        background: '#4b4b4b',
        width: 60px;
        height: 60px;
        font: 300 28px RobotoDraft;
      }
    */}
  ]
});

function getCalcButton() {
  return PolymerActionButton;
}

var inChromeApp = chrome && chrome.runtime && chrome.runtime.id;
if ( ! inChromeApp ) {
  var paperButtonComponentLink = document.createElement('link');
  paperButtonComponentLink.setAttribute('rel', 'import');
  paperButtonComponentLink.setAttribute(
      'href',
      '../../bower_components/paper-button/paper-button.html');
  document.head.appendChild(paperButtonComponentLink);
}
// TODO(markdittmer): else load from Chrome App-friendly location
