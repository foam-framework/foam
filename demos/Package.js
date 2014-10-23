DEBUG = true;

CLASS({
  package: 'demo.bank',
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
    'demo.bank.Account as A'
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
      debugger;

      a.setStatus(true);
      a.deposit(100);
      // this.X.log(a.toJSON());
      this.l(a.toJSON());
    }
  }
});


CLASS({
  name: 'Child',

  imports: [ 'log', 'x as x$' ],

  properties: [
    {
      name: 'x',
      postSet: function(oldValue, newValue) {
        this.log('x ', oldValue, ' -> ', newValue);
      }
    }
  ]
});

CLASS({
  name: 'Parent',

  requires: [ 'Child' ],
  exports: [ 'x$ as x' ],
  properties: [ 'x' ],
  methods: {
    test: function() {
      var c = this.Child.create();
      this.x = 1;
      this.x = 2;
      this.x = 3;
    }
  }
});

var p = Parent.create();
p.test();

X.demo.AccountTester.create().test();

/*
var a = demo.account.Account.create();

// Both Pass
a.setStatus(true);
a.deposit(100);
*/

var X1 = this.sub({}, 'X1');
var X2 = X1.sub({}, 'X2');
var abc = XpackagePath(X1, 'a.b.c');
X2.a;
