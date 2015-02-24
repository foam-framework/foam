CLASS({
  name: 'SecondaryButtonsView',
  package: 'foam.apps.calc',
  extendsModel: 'foam.ui.View',
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
            font:   '300 20px RobotoDraft'
          }), 'ActionButton');
          %>
          <div id="%%id" class="buttons button-row secondaryButtons">
            <div class="button-column" style="flex-grow: 1;">
              <div class="button-row">
                $$backspace{tabIndex: 311, label: '⌫'}
                $$round{tabIndex: 312}
                $$fetch{tabIndex: 313}
                $$store{tabIndex: 314}
              </div>
              <div class="button-row">
                $$e{tabIndex: 321}
                $$ln{tabIndex: 322}
                $$log{tabIndex: 323}
                $$exp{tabIndex: 324}
              </div>
              <div class="button-row">
                $$inv{tabIndex: 331}
                $$pow{tabIndex: 332}
                $$sqroot{tabIndex: 333}
                $$root{tabIndex: 334}
              </div>
              <div class="button-row">
                $$sign{tabIndex: 341}
                $$percent{tabIndex: 342}
                $$square{tabIndex: 343}
                $$pi{tabIndex: 344}
              </div>
            </div>
          </div>
    */}
  ]
});
