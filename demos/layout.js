CLASS({
  name: 'OrbitingLayout',
  extends: 'foam.ui.View',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
  properties: [
    { name: 'view' },
    { name: 'views', factory: function() { return []; } },
    { name: 'window' },
    { name: 'timer', factory: function() { return Timer.create({}); } },
    { name: 'dest',  factory: function() { return Point.create({ x: 300, y: 300 });  } }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.timer.start();
    },

    toHTML: function() {
      this.children = this.views.concat([this.view]);
      return '<div id="' + this.id + '" style="position:relative">' +
        this.view.toHTML() +
        this.views.map(function(v) { return v.toHTML(); }).join('') +
        '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.width$ = this.window.width$;
      this.height$ = this.window.height$
      Movement.orbit(this.timer, this.dest, this.view, 30, 10000);
      var offset = Math.PI*2 / this.views.length;
      for ( var i = 0; i < this.views.length; i++ ) {
        this.views[i].z = i + 1;
        Movement.orbit(this.timer, this.view, this.views[i], 300, 15000, offset);
        offset += Math.PI*2 / this.views.length;
      }
    }
  }
});

var win  = Window.create({ window: window });
var view = DetailView.create({ data: win });
var mail = EMail.create({});

var v    = OrbitingLayout.create({
  window: win,
  view: FloatingView.create({ view: view }),
  views: [
    FloatingView.create({ view: DetailView.create({ data: mail }) }),
    FloatingView.create({ view: DetailView.create({ data: mail }) }),
    FloatingView.create({ view: DetailView.create({ data: mail }) }),
    FloatingView.create({ view: DetailView.create({ data: mail }) })
  ]
});
v.write();
