function makeOp(name, sym, key, f) {
  f.toString = function() { return sym; };
  return {
    name: name,
    label: sym,
    keyboardShortcuts: [key],
    action: function() { this.op = f; }
  };
}

function makeNum(n) {
  return {
    name: n.toString(),
    keyboardShortcuts: [48+n /* 0 */ , 96+n /* keypad-0 */],
    action: function() { this.a2 = this.a2 == 0 ? n : this.a2.toString() + n; }
  };
}

var DEFAULT_OP = function(a1) { return a1; };
DEFAULT_OP.toString = function() { return ''; };


FOAModel({
  name:  'CalcFloatFieldView',
  extendsModel: 'FloatFieldView',
  methods: { valueToText: function(v) { return v == 0 ? '' : v.toString(); } }
});

FOAModel({ name: 'History', properties: [ { name: 'op' }, { name: 'a2' } ] });

FOAModel({
  name: 'Calc',

  properties: [
    { name: 'a1', defaultValue: '0' },
    { name: 'a2', view: 'CalcFloatFieldView', defaultValue: 0 },
    {
      name: 'op',
      preSet: function(oldOp, newOp) {
        if ( newOp !== DEFAULT_OP && oldOp !== DEFAULT_OP ) {
          var a1 = this.a1;
          var a2 = this.a2;
          var a3 = this.op(parseFloat(a1), parseFloat(a2));
          this.history.put(History.create(this));
          this.history.put(History.create({a2: a3}));
          this.a1 = a3;
          this.a2 = 0;
        }
        else if ( this.a2 ) {
          this.history.put(History.create({a2: this.a2}));
          this.a1 = this.a2;
          this.a2 = 0;
        }
        return newOp;
      },
      defaultValue: DEFAULT_OP
    },
    {
      name: 'history',
      model_: 'DAOProperty',
      view: { model_: 'DAOListView', rowView: 'HistoryView' },
      factory: function() { return []; }
    }
  ],

  actions: [
    makeNum(1), makeNum(2), makeNum(3),
    makeNum(4), makeNum(5), makeNum(6),
    makeNum(7), makeNum(8), makeNum(9), makeNum(0),
    makeOp('div',   '\u00F7', 191, function(a1, a2) { return a1 / a2; }),
    makeOp('mult',  '\u00D7', 'shift-56', function(a1, a2) { return a1 * a2; }),
    makeOp('plus',  '+',      'shift-187', function(a1, a2) { return a1 + a2; }),
    makeOp('minus', '&#150;', 189, function(a1, a2) { return a1 - a2; }),
    {
      name: 'ac',
      label: 'AC',
      help: 'All Clear.',
      keyboardShortcuts: [ 65 /* a */, 67 /* c */ ],
      action: function() { this.op = DEFAULT_OP; this.a1 = 0; this.history = []; }
    },
    {
      name: 'sign',
      label: '+/-',
      keyboardShortcuts: [ 78 /* n */ , 83 /* s */],
      action: function() { this.a2 = - this.a2; }
    },
    {
      name: 'point',
      label: '.',
      keyboardShortcuts: [ 190 ],
      action: function() {
        if ( this.a2.toString().indexOf('.') == -1 ) this.a2 = this.a2 + '.';
      }
    },
    {
      name: 'equals',
      label: '=',
      keyboardShortcuts: [ 187 /* '=' */, 13 /* <enter> */ ],
      action: function() {
        var a1 = this.a1;
        var a2 = this.a2;
        this.a1 = a2;
        this.history.put(History.create(this));
        this.a2 = this.op(parseFloat(a1), parseFloat(a2));
        this.op = DEFAULT_OP;
      }
    },
    {
      name: 'backspace',
      keyboardShortcuts: [ 8 /* backspace */ ],
      action: function() {
        this.a2 = this.a2 == 0 ? this.a2 : this.a2.toString().substring(0, this.a2.length-1);
      }
    }
  ]
});

FOAModel({ name: 'HistoryView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'CalcView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
