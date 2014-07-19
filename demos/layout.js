MODEL({
  name: 'OrbitingLayout',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait'],
  properties: [
    { name: 'view' },
    { name: 'window' },
    { name: 'timer', factory: function() { return Timer.create({}); } },
    { name: 'dest',  factory: function() { return Point.create({ x: 100, y: 100 });  } }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.timer.start();
    },

    toHTML: function() {
      this.children = [this.view];
      return '<div id="' + this.id + '" style="position:relative">' + this.view.toHTML() + '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.width$ = this.window.width$;
      this.height$ = this.window.height$
      Movement.orbit(this.timer, this.dest, this.view, 30, 10000);
    }
  }
});

var win  = Window.create({ window: window });
var view = DetailView.create({ data: win });
var v    = OrbitingLayout.create({ window: win, view: FloatingView.create({ view: view }) });
v.write(document);
