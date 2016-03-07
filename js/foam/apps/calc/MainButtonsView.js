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
  package: 'foam.apps.calc',
  name: 'MainButtonsView',
  extends: 'foam.ui.View',
  requires: [
    'foam.apps.calc.CalcButton'
  ],
  templates: [
    function toHTML() {/*
      <div id="%%id" class="buttons button-row" style="background:#4b4b4b;">
        <div class="button-column" style="flex-grow: 3;-webkit-flex-grow: 3;">
          <div class="button-row">
            $$7{tabIndex: 101} $$8{tabIndex: 102} $$9{tabIndex: 103}
          </div>
          <div class="button-row">
            $$4{tabIndex: 104}$$5{tabIndex: 105}$$6{tabIndex: 106}
         </div>
          <div class="button-row">
            $$1{tabIndex: 107}$$2{tabIndex: 108}$$3{tabIndex: 109}
          </div>
          <div class="button-row">
            $$point{tabIndex: 111}$$0{tabIndex: 111}$$equals{tabIndex: 112}
          </div>
        </div>
      <%
      this.X.registerModel(this.CalcButton.xbind({
        background: '#777',
        width:  70,
        height: 45,
        font:   '300 26px Roboto'
      }), 'foam.ui.ActionButton');
      %>
        <div class="button-column rhs-ops" style="flex-grow: 1;-webkit-flex-grow: 1;padding-top: 7px; padding-bottom: 10px;">
          $$ac{tabIndex: 201, font: '300 24px Roboto'
}
          $$plus{tabIndex: 202}
          $$minus{tabIndex: 203}
          $$div{tabIndex: 204}
          $$mult{tabIndex: 205}
        </div>
      </div>
    */}
  ]
});
