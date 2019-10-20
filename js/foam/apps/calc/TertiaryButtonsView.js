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
            color:      'rgb(80, 80, 80)',
            background: 'rgb(29, 233, 182)',
            font:       '300 18px Roboto'
          }), 'foam.ui.ActionButton');
          %>
          <div id="%%id" class="buttons button-row tertiaryButtons">
            <div class="button-column" style="flex-grow: 1;-webkit-flex-grow: 1;">
              <div class="button-row">
                $$deg{tabIndex: 411,  arrowNav: ['.f1', '[sin]',  '[store]', '[rad]']}
                $$rad{tabIndex: 412,  arrowNav: ['.f1', '[asin]', '[deg]',   '[fact]']}
                $$fact{tabIndex: 413, arrowNav: ['.f1', '[mod]',  '[rad]',    null]}
              </div>
              <div class="button-row">
                $$sin{tabIndex: 421,  arrowNav: ['[deg]',  '[cos]',   '[exp]',  '[asin]']}
                $$asin{tabIndex: 422, arrowNav: ['[rad]',  '[acos]',  '[sin]',  '[mod]']}
                $$mod{tabIndex: 423,  arrowNav: ['[fact]', '[p]',     '[asin]',  null]}
              </div>
              <div class="button-row">
                $$cos{tabIndex: 431,  arrowNav: ['[sin]',    '[tan]',   '[root]',      '[acos]']}
                $$acos{tabIndex: 432, arrowNav: ['[asin]',   '[atan]',  '[cos]',       '[p]']}
                $$p{tabIndex: 433,    arrowNav: ['[mod]',    '[c]',     '[acos]',  null]}
              </div>
              <div class="button-row">
                $$tan{tabIndex: 441,   arrowNav: ['[cos]',  null, '[pi]',     '[atan]']}
                $$atan{tabIndex: 442,  arrowNav: ['[acos]', null, '[tan]',    '[c]']}
                $$c{tabIndex: 443,     arrowNav: ['[p]',    null, '[atan]',   null]}
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
