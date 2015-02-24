CLASS({
  name: 'HistoryCitationView',
  package: 'foam.apps.calc',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div class="history" tabindex="2">{{{this.data.op}}}&nbsp;{{this.data.a2}}<% if ( this.data.op.toString() ) { %><hr aria-label="{{Calc.EQUALS.speechLabel}}" tabindex="2"><% } %></div>
    */}
  ]
});
