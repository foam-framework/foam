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
  extendsModel: 'foam.ui.View',
  requires: ['foam.apps.calc.CalcButton'],
  templates: [
    function toHTML() {/*
          <%
          this.X.registerModel(this.CalcButton.xbind({
            width:      61,
            height:     61,
            color:      'rgb(80, 80, 80)',
            background: 'rgb(29, 233, 182)',
            font:       '300 18px RobotoDraft'
          }), 'foam.ui.ActionButton');
          %>
          <div id="%%id" class="buttons button-row tertiaryButtons">
            <div class="button-column" style="flex-grow: 1;-webkit-flex-grow: 1;">
              <div class="button-row">
                $$deg{tabIndex: 411} $$rad{tabIndex: 412} $$fact{tabIndex: 413}
              </div>
              <div class="button-row">
                $$sin{tabIndex: 421} $$asin{tabIndex: 422} $$mod{tabIndex: 423}
              </div>
              <div class="button-row">
                $$cos{tabIndex: 431} $$acos{tabIndex: 432} $$p{tabIndex: 433}
              </div>
              <div class="button-row">
                $$tan{tabIndex: 441} $$atan{tabIndex: 442} $$c{tabIndex: 443}
              </div>
            </div>
          </div>
          <%
            var l = function(_, _, _, degrees) {
              this.degView.font = degrees ? '600 18px RobotoDraft' : '300 18px RobotoDraft';
              this.radView.font = degrees ? '300 18px RobotoDraft' : '600 18px RobotoDraft';
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
