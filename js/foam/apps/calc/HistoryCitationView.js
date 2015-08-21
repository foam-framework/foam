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
  extendsModel: 'foam.ui.View',
  templates: [
    function toHTML() {/*
      <div class="history" tabindex="2">{{{this.data.op}}}&nbsp;{{this.data.a2}}<% if ( this.data.op.toString() ) { %><hr aria-label="{{Calc.EQUALS.speechLabel}}" tabindex="2"><% } %></div>
    */}
  ]
});
