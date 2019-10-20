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
            $$7{tabIndex: 101, arrowNav: ['.f1', '[4]',   null, '[8]']}
            $$8{tabIndex: 102, arrowNav: ['.f1', '[5]',  '[7]', '[9]']}
            $$9{tabIndex: 103, arrowNav: ['.f1', '[6]',  '[8]', '[ac]' ]}
          </div>
          <div class="button-row">
            $$4{tabIndex: 104, arrowNav: ['[7]', '[1]',   null, '[5]']}
            $$5{tabIndex: 105, arrowNav: ['[8]', '[2]',  '[4]', '[6]']}
            $$6{tabIndex: 106, arrowNav: ['[9]', '[3]',  '[5]', '[plus]']}
         </div>
          <div class="button-row">
            $$1{tabIndex: 107, arrowNav: ['[4]', '[point]',  null,  '[2]']}
            $$2{tabIndex: 108, arrowNav: ['[5]', '[0]',      '[1]',  '[3]']}
            $$3{tabIndex: 109, arrowNav: ['[6]', '[equals]', '[2]', '[minus]']}
          </div>
          <div class="button-row">
            $$point{tabIndex: 111,  arrowNav: ['[1]', null,  null,     '[0]']}
            $$0{tabIndex: 111,      arrowNav: ['[2]', null, '[point]', '[equals]']}
            $$equals{tabIndex: 112, arrowNav: ['[3]', null, '[0]',     '[mult]']}
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
          $$ac{tabIndex: 201,    arrowNav: ['.f1',         '[plus]',     '[9]',      '[backspace]'], font: '300 24px Roboto'}
          $$plus{tabIndex: 202,  arrowNav: ['[ac]', '[minus]',    '[6]',      '[e]']}
          $$minus{tabIndex: 203, arrowNav: ['[plus]',      '[div]',   '[3]',      '[inv]']}
          $$div{tabIndex: 204,   arrowNav: ['[minus]',     '[mult]', '[3]',      '[inv]']}
          $$mult{tabIndex: 205,  arrowNav: ['[div]',     null,        '[equals]', '[sign]']}
        </div>
      </div>
    */}
  ]
});
