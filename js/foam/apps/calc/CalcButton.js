CLASS({
  name: 'CalcButton',
  package: 'foam.apps.calc',
  extendsModel: 'foam.graphics.ActionButtonCView',
  properties: [
    {
      name: 'color',
      defaultValue: 'white'
    },
    {
      name: 'background',
      defaultValue: '#4b4b4b'
    },
    {
      name: 'width',
      defaultValue: 60
    },
    {
      name: 'height',
      defaultValue: 60
    },
    {
      name: 'font',
      defaultValue: '300 28px RobotoDraft'
    },
    {
      name: 'role',
      defaultValue: 'button'
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      setTimeout(function() { this.view.paint(); }.bind(this), 1000);
    },
    toView_: function() {
      var v = this.SUPER();
      return v.decorate('toHTML', function(SUPER) { return '<div class="button">' + SUPER.call(this) + '</div>';}, v.toHTML);
    }
  }
});
