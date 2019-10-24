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
  name: 'TertiaryButtonsView',
  package: 'foam.apps.calc',
  extends: 'foam.ui.View',
  requires: ['foam.apps.calc.CalcButton'],
  templates: [
    function toHTML() {/*
          <%
          this.X.registerModel(this.CalcButton.xbind({
            width:      61,
            height:     61,
            color:      '#444',
            background: '#1DE9B6',
            font:       '300 18px Roboto'
          }), 'foam.ui.ActionButton');
          %>
          <div id="%%id" class="buttons button-row tertiaryButtons">
            <div class="button-column" style="flex-grow: 1;-webkit-flex-grow: 1;">
              <div class="button-row">
                $$deg{tabIndex: 411,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['.f1', '[sine]',  '[store in memory]', '[switch to radians]']}
                $$rad{tabIndex: 412,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['.f1', '[arcsine]', '[switch to degrees]',   '[factorial]']}
                $$fact{tabIndex: 413, haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['.f1', '[modulo]',  '[switch to radians]',    null]}
              </div>
              <div class="button-row">
                $$sin{tabIndex: 421,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[switch to degrees]',  '[cosine]',   '[e to the power of n]',  '[arcsine]']}
                $$asin{tabIndex: 422, haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[switch to radians]',  '[arccosine]',  '[sine]',  '[modulo]']}
                $$mod{tabIndex: 423,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[factorial]', '[permutation]',     '[arcsine]',  null]}
              </div>
              <div class="button-row">
                $$cos{tabIndex: 431,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[sine]',    '[tangent]',   '[divide]',      '[arccosine]']}
                $$acos{tabIndex: 432, haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[arcsine]',   '[arctangent]',  '[cosine]',       '[permutation]']}
                $$p{tabIndex: 433,    haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[modulo]',    '[combination]',     '[arccosine]',  null]}
              </div>
              <div class="button-row">
                $$tan{tabIndex: 441,   haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[cosine]',  null, '[π]',     '[arctangent]']}
                $$atan{tabIndex: 442,  haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[arccosine]', null, '[tangent]',    '[combination]']}
                $$c{tabIndex: 443,     haloColor: 'rgba(0, 0, 0, 0.2)', arrowNav: ['[permutation]',    null, '[arctangent]',   null]}
              </div>
            </div>
          </div>
          <%
            var l = function(_, __, ___, degrees) {
              this.degView.font = degrees ? '600 18px Roboto' : '300 18px Roboto';
              this.radView.font = degrees ? '300 18px Roboto' : '600 18px Roboto';
              if ( this.degView.view ) {
                this.degView.view.paint();
                this.radView.view.paint();
              }
            }.bind(this);
            this.data.degreesMode$.addListener(l);
            l();
          %>
    */}
  ]
});
