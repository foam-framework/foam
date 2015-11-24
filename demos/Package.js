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

        console.log('Bank: ', this.X.Bank);
        return this.balance;
      }
    },
    {
      name: "withdraw",
      code: function (amount) {
        this.balance -= amount;

        return this.balance;
      }
    }
  ]
});


CLASS({
  package: 'demo.bank',
  name: 'SavingsAccount',
  extends: 'demo.bank.Account',

  methods: [
    {
      name: "withdraw",
      code: function (amount) {
        // charge a fee
        this.balance -= 0.05;

        return this.SUPER(amount);
      }
    }
  ]
});


CLASS({
  package: 'demo.bank',
  name: 'AccountTester',

  requires: [
    'demo.bank.Account as A',
    'demo.bank.SavingsAccount'
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
      a.withdraw(10);
      this.l(a.toJSON());

      var s = this.SavingsAccount.create({id: 43});
      s.setStatus(true);
      s.deposit(100);
      s.withdraw(10);
      this.l(s.toJSON());
    }
  }
});

var a = X.demo.bank.AccountTester.create({},X);
a.test();

// TODO: Re-enable when models as packages works again.
//CLASS({
//  package: 'demo.bank.Account',
//  name: 'AccountInnerModel',

//  properties: [ 'a', 'b', 'c' ],
//});
//
//var im = X.demo.bank.Account.AccountInnerModel.create({a:1, b:2, c:3});
//console.log(im.toJSON());



CLASS({
  name: 'Child',

  imports: [ 'log', 'x$' ],

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
  exports: [ 'x' ],
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


// X = X.sub({}, 'ROOT');
// X.AccountTester.create().test();
// var a = demo.account.Account.create();


var X1 = this.sub({}, 'X1');
var X2 = X1.sub({}, 'X2');
var abc = packagePath(X1, 'a.b.c');
X2.a;

console.log('done');
