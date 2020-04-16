/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'HistoryCitationView',
  package: 'foam.apps.calc',
  extends: 'foam.ui.View',
  templates: [
    function toHTML() {/*
      <div class="history" role="listitem" tabindex="2" aria-label="{{(this.data.sayEquals) ? (window.chrome.i18n ? window.chrome.i18n.getMessage('Calc_ActionSpeechLabel_equals') + ' ' : 'equals ') : ''}}{{this.data.op.speechLabel}} {{this.data.a2}}">
        <span aria-hidden="true">{{{this.data.op.label}}}&nbsp;{{this.data.a2}}<span>
      </div>
      <% if ( this.data.op.label ) { %><hr aria-hidden="true"><% } %>
    */}
  ]
});
