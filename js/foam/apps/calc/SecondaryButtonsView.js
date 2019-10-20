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
  name: 'SecondaryButtonsView',
  package: 'foam.apps.calc',
  extends: 'foam.ui.View',
  requires: [
    'foam.apps.calc.CalcButton'
  ],
  templates: [
    function toHTML() {/*
          <%
          this.X.registerModel(this.CalcButton.xbind({
            background: 'rgb(52, 153, 128)',
            width:  61,
            height: 61,
            font:   '300 20px Roboto'
          }), 'foam.ui.ActionButton');
          %>
          <div id="%%id" class="buttons button-row secondaryButtons">
            <div class="button-column" style="flex-grow: 1;-webkit-flex-grow: 1;">
              <div class="button-row">
                $$backspace{tabIndex: 311, arrowNav: ['.f1', '[e]',    '[ac]',         '[round]'], label: '⌫'}
                $$round{tabIndex: 312,     arrowNav: ['.f1', '[ln]',   '[backspace]',  '[fetch]']}
                $$fetch{tabIndex: 313,     arrowNav: ['.f1', '[log]',  '[round]',      '[store]']}
                $$store{tabIndex: 314,     arrowNav: ['.f1', '[exp]',  '[fetch]',      '[deg]']}
              </div>
              <div class="button-row">
                $$e{tabIndex: 321,   arrowNav: ['[backspace]', '[inv]',     '[plus]',   '[ln]']}
                $$ln{tabIndex: 322,  arrowNav: ['[round]',     '[pow]',     '[e]',      '[log]']}
                $$log{tabIndex: 323, arrowNav: ['[fetch]',     '[sqroot]',  '[ln]',     '[exp]']}
                $$exp{tabIndex: 324, arrowNav: ['[store]',     '[root]',    '[log]',    '[sin]']}
              </div>
              <div class="button-row">
                $$inv{tabIndex: 331,    arrowNav: ['[e]',    '[sign]',     '[div]',     '[pow]']}
                $$pow{tabIndex: 332,    arrowNav: ['[ln]',   '[percent]',  '[inv]',     '[sqroot]']}
                $$sqroot{tabIndex: 333, arrowNav: ['[log]',  '[square]',   '[pow]',     '[root]']}
                $$root{tabIndex: 334,   arrowNav: ['[exp]',  '[pi]',       '[sqroot]',  '[cos]']}
              </div>
              <div class="button-row">
                $$sign{tabIndex: 341,    arrowNav: ['[inv]',   null, '[mult]',    '[percent]']}
                $$percent{tabIndex: 342, arrowNav: ['[pow]',   null, '[sign]',    '[square]']}
                $$square{tabIndex: 343,  arrowNav: ['[sqroot]', null, '[percent]', '[pi]']}
                $$pi{tabIndex: 344,      arrowNav: ['[root]',  null, '[square]',  '[tan]']}
              </div>
            </div>
          </div>
    */}
  ]
});
