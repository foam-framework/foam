FOAModel({
  name:  'CalcFloatFieldView',

  extendsModel: 'FloatFieldView',

  methods: {
    valueToText: function(v) {
      return v == 0 ? '' : v.toString();
    }
  }
});

FOAModel({
  name: 'History',
  properties: [
    { name: 'id' },
    { name: 'op' },
    { name: 'a2' }
  ]
});

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
    { name: 'a2', view: 'CalcFloatFieldView', defaultValue: '0' },
    {
      name: 'op',
      postSet: function() {
        this.history.put(History.create({a2: this.a2}));
        this.a1 = this.a2;
        this.a2 = 0;
      },
      defaultValue: DEFAULT_OP
    },
    {
      name: 'history',
      model_: 'DAOProperty',
      view: { model_: 'DAOListView', rowView: 'HistoryView' },
      factory: function() { return EasyDAO.create({model: History, seqNo: true, daoType: 'MDAO'}); }
    }
  ],

  methods: {
    num: function(n) { this.a2 = this.a2 == 0 ? n : this.a2.toString() + n; }
  },

  actions: [
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
    makeOp('div',   '\u00F7', function(a1, a2) { return a1 / a2; }),
    makeOp('mult',  '\u00D7', function(a1, a2) { return a1 * a2; }),
    makeOp('plus',  '+',      function(a1, a2) { return a1 + a2; }),
    makeOp('minus', '&#150;', function(a1, a2) { return a1 - a2; }),
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
        this.history.put(History.create(this));
        this.a2 = this.op(parseFloat(a1), parseFloat(a2));
        this.op = DEFAULT_OP;
      }
    }
  ]
});

FOAModel({ name: 'HistoryView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });

FOAModel({ name: 'CalcView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
