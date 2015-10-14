CLASS({
  package: 'foam.apps.calc.test',
  name: 'CalcTest',
  extendsModel: 'UnitTest',
  properties: [
    {
      name: 'name',
      tableLabel: '#'
    },
    {
      name: 'input',
    },
    {
      name: 'description',
      tableWidth: '30%',
      tableLabel: 'input',
      defaultValueFn: function() { return this.input; }
    },
    {
      name: 'result'
    },
    {
      name: 'results',
      tableWidth: '40%',
      tableFormatter: function(val, obj, table) { return val; }
    },
    {
      name: 'passed',
      tableWidth: '70px',
      tableFormatter: function(val) { return (val ? '<font color=green>' : '<font color=black>' ) + val + "</font>"; }
    },
    {
      name: 'failed',
      tableWidth: '70px',
    },
    {
      name: 'code',
      lazyFactory: function() {
        var self = this;
        return function() {
          this.calc.ac();
          var ks = self.input.split(" ");
          for ( var i = 0 ; i < ks.length ; i++ ) this.calc[ks[i]]();
          if ( this.calc.a2 == this.calc.a2 ) {
            // this.calc.a2 is not NaN
            this.assert(this.calc.a2 == self.result, "Expecting: " + self.result + " found: " + this.calc.a2);
          } else {
            // this.calc.a2 is NaN, check if result is as well
            this.assert(self.result != self.result, "Expecting: " + self.result + " found: " + this.calc.a2);
          }
        };
      }
    }
  ]
});
