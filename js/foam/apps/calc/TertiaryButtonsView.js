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
          }), 'ActionButton');
          %>
          <div id="%%id" class="buttons button-row tertiaryButtons">
            <div class="button-column" style="flex-grow: 1;">
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
              if ( this.degView.canvas ) {
                this.degView.view.paint();
                this.radView.view.paint();
              }
              this.degView.font = degrees ? '600 18px RobotoDraft' : '300 18px RobotoDraft';
              this.radView.font = degrees ? '300 18px RobotoDraft' : '600 18px RobotoDraft';
            }.bind(this);
            this.data.degreesMode$.addListener(l);
            l();
          %>
    */}
  ]
});
