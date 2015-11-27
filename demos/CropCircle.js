arequire('foam.graphics.CView')(function() {

CLASS({
  name:  'CropCircle',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'scale',
      defaultValue: 1.0
    },
    {
      name: 'width',
      defaultValue: 700
    },
    {
      name: 'height',
      defaultValue: 700
    },
    {
      name: 'background',
      defaultValue: 'lightgreen'
    },
    {
      name: 'color',
      defaultValue: 'black'
    },
    'canvas',
    {
      name: 'f',
      preSet: function(_, f) {
        var X = {
          d: this.d.bind(this),
          t: this.t.bind(this),
          s: this.s.bind(this),
          r: this.r.bind(this),
          c: this.c.bind(this),
          c2: this.c2.bind(this),
          c3: this.c3.bind(this),
          sym: this.sym.bind(this)
        };
        with ( X ) { f = eval('(' + f.toString() + ')'); }
        X.f = f.bind(this);
        return X.f;
      },
      defaultValue: function() { this.c(); }
    }
  ],

  methods: {
    // depth
    d: function(n, f) {
      var i = 0;
      return function() {
        console.log(i, n);
        if ( i++ <= n ) {
          f();
        } else {
//          i = 0;
        }
      };
    },

    // translate
    t: function(x, y, f) {
      var c = this.canvas;
      return function() {
        c.save();
        c.translate(x, y);
        f();
        c.restore();
      };
    },

    // scale
    s: function(s, f) {
      var c = this.canvas;
      return function() {
        c.save();
        var oldScale = this.scale;
        this.scale *= s;
        c.scale(s, s);
        f();
        this.scale = oldScale;
        c.restore();
      }.bind(this);
    },

    // rotate
    r: function(a, f) {
      var c = this.canvas;
      return function() {
        c.save();
        c.rotate(a);
        f();
        c.restore();
      };
    },

    // circle
    c: function() {
      var c = this.canvas;

      c.beginPath();
      c.fillStyle = this.color;
      c.arc(0, 0, 25, 0, Math.PI*2, true);
      c.fill();
    },

    // circle
    c2: function() {
      var c = this.canvas;

      c.lineWidth = 1;
      c.strokeStyle = 'black';
      c.beginPath();
      c.arc(0, 0, 25, 0, Math.PI*2, true);
      c.closePath();
      c.stroke();

      /*
      c.beginPath();
      c.fillStyle = this.color;
      c.arc(0, 0, 25, 0, Math.PI*2, true);
      c.fill();
      */
    },

    // transparent circle
    c3: function() {
      var c = this.canvas;

      c.beginPath();
      c.globalAlpha = 0.25;
      c.fillStyle = this.color;
      c.arc(0, 0, 25, 0, Math.PI*2, true);
      c.fill();
    },

    sym: function(n, f) {
      var c = this.canvas;
      return function() {
        for ( var i = 0 ; i < n ; i++ ) {
          c.save();
          c.rotate(2 * Math.PI * i /n);
          f();
          c.restore();
        }
      };
    },

    paintSelf: function(c) {
      this.canvas = c;
      c.translate(this.width/2, this.height/2);
      c.save();
      this.f();
      c.restore();
    }
  }
});

// limit, rotate, scale, tx, ty, s, f, fDone
var fs = [
  function() { if ( this.scale < .1 ) return; c2(); sym(2, s(0.7, t(0, 100, f)))(); },
  function() { if ( this.scale < .1 ) return; c2(); sym(3, s(0.7, t(0, 100, f)))(); },
  function() { if ( this.scale < .1 ) return; c2(); sym(4, s(0.7, t(0, 100, f)))(); },
  function() { if ( this.scale < .15 ) return; c2(); sym(5, s(0.7, t(0, 100, f)))(); },
  function() { if ( this.scale < .15 ) return; c2(); sym(6, s(0.7, t(0, 100, f)))(); },

  function() { if ( this.scale < .1 ) return; c2(); sym(2, s(0.6, t(10, 100, f)))(); },
  function() { if ( this.scale < .1 ) return; c2(); sym(3, s(0.6, t(10, 100, f)))(); },
  function() { if ( this.scale < .1 ) return; c2(); sym(4, s(0.6, t(10, 100, f)))(); },
  function() { if ( this.scale < .15 ) return; c2(); sym(5, s(0.6, t(10, 100, f)))(); },
  function() { if ( this.scale < .15 ) return; c2(); sym(6, s(0.6, t(10, 100, f)))(); },
  // symetric tree
  function() { if ( this.scale < .02 ) return; c(); t(0, -50, c)(); t(0, -100, c)();  t(0, -135, s(0.5, f))(); t(-38, -110, s(0.6, r(-1.2, f)))(); t(40, -105, r(1.2, s(0.6, f)))();  },
  // tree
  function() { if ( this.scale < .01 ) return; c(); t(0, -50, c)(); t(0, -100, c)();  t(0, -150, c)(); t(-38, -160, s(0.6, r(-1.2, f)))(); t(40, -105, r(1.2, s(0.6, f)))();  },
  function() { if ( this.scale < .2 ) return; c2(); r(0.1, s(0.65, sym(7, t(250, 0, f))))(); },
  function() { if ( this.scale < .2 ) return; c(); r(0, s(0.6, sym(8, t(250, 0, f))))(); },
  function() { if ( this.scale < .2 ) return; c(); r(0, s(0.6, sym(12, t(250, 0, f))))(); },
  function() { if ( this.scale < .25 ) return; c3(); r(0, s(0.5, sym(36, t(300, 0, f))))(); },
  function() { if ( this.scale < .6 ) return; c2(); r(0, s(0.78, sym(36, t(120, 0, f))))(); },
  function() { if ( this.scale < .55 ) return; c2(); r(0, s(0.78, sym(11, t(120, 0, f))))(); },
  function() { if ( this.scale < .3 ) return; c(); r(0, s(0.78, sym(3, t(120, 0, f))))(); },
  function() { if ( this.scale < .3 ) return; c2(); r(Math.PI/36, s(0.78, sym(3, t(120, 0, f))))(); },
  function() { if ( this.scale < .38 ) return; c2(); r(Math.PI/5, s(0.78, sym(3, t(120, 0, f))))(); },
  function() { if ( this.scale < .5 ) return; c2(); r(0.4, s(0.9, sym(3, t(80, 0, f))))(); },
  function() { if ( this.scale < .5 ) return; c2(); r(0, s(0.9, sym(3, t(80, 0, f))))(); },
  function() { if ( this.scale < .1 ) return; c(); s(0.7, sym(3, t(160, 0, f)))(); },
  // shells
  function() { if ( this.scale < .08 ) return; c(); t(5, 0, s(0.98, r(.1, f)))(); },
  function() { if ( this.scale < .1 ) return; c(); t(50, 0, s(0.8, r(1.2, f)))(); },
  // fern
  function() { if ( this.scale < .1 ) return; c(); s(0.48, r(1.2, f))(); s(0.48, r(-1.2, f))(); r(0.07, s(0.92, t(0, -40, f)))(); },
  function() { if ( this.scale < .4 ) return; c3(); sym(7, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .3 ) return; c3(); sym(5, s(0.8, t(110, 0, f)))(); },
  function() { c(); s(0.5, sym(8, t(150, 150, c)))(); },
  function() { if ( this.scale < .4 ) return; c(); sym(5, s(0.7, t(80, 0, f)))(); },
  // snowflake
  function() { if ( this.scale < .4 ) return; c(); sym(5, s(0.7, t(50, 0, f)))(); },
  // pentagon
  function() { if ( this.scale < .25 ) return; c(); sym(5, s(0.7, t(90, 0, f)))(); },
  function() { if ( this.scale < .6 ) return; c(); sym(5, s(0.85, t(110, 0, f)))(); },
  function() { if ( this.scale < .5 ) return; c2(); sym(7, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .5 ) return; c(); sym(7, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .5 ) return; c(); sym(3, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .4 ) return; c(); sym(3, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .3 ) return; c2(); sym(2, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .3 ) return; c3(); sym(2, s(0.8, t(110, 0, f)))(); },
  function() { if ( this.scale < .01 ) return; c2(); sym(1, s(0.95, r(0.45, t(70, 0, f))))(); },
  function() { c(); }
];

// for ( var i = 0 ; i < 1  ; i++ ) {
for ( var i = 0 ; i < fs.length  ; i++ ) {
  var cs = CropCircle.create({f: fs[i]});
  cs.write();
}

});
