DEBUG = true;

CLASS({
  xpackage: 'demo.account',
  name: 'Account',

  imports: [ 'reportDeposit' ],

  properties: [
    { name: 'id'      },
    { name: 'status'  },
    { name: 'balance', defaultValue: 0 }
  ],

  methods: [
    {
      name: "setStatus",
      code: function (status) {
        this.status = status;
      }
    },
    {
      name: "deposit",
      code: function (amount) {
        this.balance += amount;
        this.reportDeposit(this.id, amount, this.balance);

        return this.balance;
      }
    },
    {
      name: "withdraw",
      code: function (amount) {
        this.balance -= amount;

        return this.bal;
      }
    }
  ]
});


CLASS({
  package: 'demo',
  name: 'AccountTester',

  requires: [
//    'demo.bank.Account as A',
    'Account as A'
  ],

  imports: [
    'log as l' 
  ],

  exports: [
    'reportDeposit',
    'as Bank' // exports 'this'
  ],

  methods: {
    reportDeposit: function (id, amount, bal) {
      this.l('Deposit: ', id, amount, bal);
    },
    test: function() {
      var a = this.A.create({id: 42});

      a.setStatus(true);
      a.deposit(100);
      // this.X.log(a.toJSON());
      this.l(a.toJSON());
    }
  }
});


// X.AccountTester.create().test();

/*
var a = demo.account.Account.create();

// Both Pass
a.setStatus(true);
a.deposit(100);
*/