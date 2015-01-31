CLASS({
   "model_": "Model",
   "id": "foam.lib.email.EMailAddressParser",
   "package": "foam.lib.email",
   "name": "EMailAddressParser",
   "properties": [
      {
         "model_": "Property",
         "name": "parser",
         "lazyFactory": function () {
        return {
          __proto__: grammar,

          START: sym('address'),

          'until eol': repeat(notChar('\r')),

          'address list': repeat(sym('address'), seq(',', repeat(' '))),

          'address': alt(
            sym('labelled address'),
            sym('simple address')),

          'labelled address': seq(
            repeat(notChars('<,')),
            '<', sym('simple address'), '>'),

          'simple address': seq(repeat(notChar('@')), '@', repeat(notChars('\r>,')))
        }.addActions({
          'labelled address': function(v) { return v[0].join('') + v[1] + v[2] + v[3]; },
          'simple address': function(v) { return v[0].join('') + v[1] + v[2].join(''); }
        });
      }
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
