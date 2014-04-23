function makeOp(name, sym, f) {
  f.toString = function() { return sym; };
  return { name: name, label: sym, action: function() { this.op = f; } };
}

var DEFAULT_OP = function(a1) { return a1; };
DEFAULT_OP.toString = function() { return ''; };

FOAModel({
  name: 'Calc',

  properties: [
    { name: 'a1', defaultValue: '0' },
    { name: 'a2', defaultValue: '0' },
    {
      name: 'op',
      postSet: function() { this.a1 = this.a2; this.a2 = 0; },
      defaultValue: DEFAULT_OP
    },
    { name: 'history', model_: 'StringArrayProperty', factory: function() { return []; } }
  ],

  methods: {
    num: function(n) { this.a2 = this.a2 == 0 ? n : this.a2.toString() + n; }
  },

  actions: [
    {
      name: 'ac',
      label: 'AC',
      action: function() { this.op = DEFAULT_OP; this.a1 = 0; this.history = []; }
    },
    {
      name: 'sign',
      label: '+/-',
      action: function() { this.a2 = - this.a2; }
    },
    { name: '1', action: function() { this.num(1); } },
    { name: '2', action: function() { this.num(2); } },
    { name: '3', action: function() { this.num(3); } },
    { name: '4', action: function() { this.num(4); } },
    { name: '5', action: function() { this.num(5); } },
    { name: '6', action: function() { this.num(6); } },
    { name: '7', action: function() { this.num(7); } },
    { name: '8', action: function() { this.num(8); } },
    { name: '9', action: function() { this.num(9); } },
    { name: '0', action: function() { this.num(0); } },
    makeOp('div', '\u00F7', function(a1, a2) { return a1 / a2; }),
    makeOp('mult', '\u00D7', function(a1, a2) { return a1 * a2; }),
    makeOp('plus', '+', function(a1, a2) { return a1 + a2; }),
    makeOp('minus', '-', function(a1, a2) { return a1 - a2; }),
    {
      name: 'point',
      label: '.',
      action: function() { if ( this.a2.toString().indexOf('.') == -1 ) this.a2 = this.a2 + '.'; }
    },
    {
      name: 'equals',
      label: '=',
      action: function() {
        var a1 = this.a1;
        var a2 = this.a2;
        this.a1 = a2;
        this.history = this.history.concat([this.a2 = this.op(parseFloat(a1), parseFloat(a2))]);
      }
    }
  ]
});

FOAModel({ name: 'CalcView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
