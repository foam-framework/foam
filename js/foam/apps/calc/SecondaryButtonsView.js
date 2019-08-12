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
            background: '#00796b',
            width:  61,
            height: 61,
            font:   '300 20px Roboto'
          }), 'foam.ui.ActionButton');
          %>
          <div id="%%id" class="buttons button-row secondaryButtons">
            <div class="button-column" style="flex-grow: 1;-webkit-flex-grow: 1;">
              <div class="button-row">
                $$backspace{tabIndex: 311, haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['.f1', '[e]',    '[all clear]',         '[round]'], label: '⌫'}
                $$round{tabIndex: 312,     haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['.f1', '[natural logarithm]',   '[backspace]',  '[fetch from memory]']}
                $$fetch{tabIndex: 313,     haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['.f1', '[log base 10]',  '[round]',      '[store in memory]']}
                $$store{tabIndex: 314,     haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['.f1', '[e to the power of n]',  '[fetch from memory]',      '[switch to degrees]']}
              </div>
              <div class="button-row">
                $$e{tabIndex: 321,   haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[backspace]', '[inverse]',     '[plus]',   '[natural logarithm]']}
                $$ln{tabIndex: 322,  haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[round]',     '[y to the power of n]',     '[e]',      '[log base 10]']}
                $$log{tabIndex: 323, haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[fetch from memory]',     '[square root]',  '[natural logarithm]',     '[e to the power of n]']}
                $$exp{tabIndex: 324, haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[store to memory]',     '[the enth root of y]',    '[log base 10]',    '[sine]']}
              </div>
              <div class="button-row">
                $$inv{tabIndex: 331,    haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[e]',    '[negate]',     '[divide]',     '[y to the power of n]']}
                $$pow{tabIndex: 332,    haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[natural logarithm]',   '[percent]',  '[inverse]',     '[square root]']}
                $$sqroot{tabIndex: 333, haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[log base 10]',  '[x squared]',   '[y to the power of n]',     '[the enth root of y]']}
                $$root{tabIndex: 334,   haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[e to the power of n]',  '[π]',       '[square root]',  '[cosine]']}
              </div>
              <div class="button-row">
                $$sign{tabIndex: 341,    haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[inverse]',   null, '[multiply]',    '[percent]']}
                $$percent{tabIndex: 342, haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[y to the power of n]',   null, '[negate]',    '[x squared]']}
                $$square{tabIndex: 343,  haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[square root]', null, '[percent]', '[π]']}
                $$pi{tabIndex: 344,      haloColor: 'rgba(255, 255, 255, 0.4)', arrowNav: ['[the enth root of y]',  null, '[x squared]',  '[tangent]']}
              </div>
            </div>
          </div>
    */}
  ]
});
