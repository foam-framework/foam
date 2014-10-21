DEBUG = true;

MODEL({
  xpackage: 'demo.account',
  name: 'Account',

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

MODEL({
  imports: [
    'Account as A'
  ],

  name: 'AccountTest',

  methods: {
    test: function() {
      var a = this.A.create();

      a.setStatus(true);
      a.deposit(100);
      console.log(a.toJSON());
    }
  }
});

AccountTest.create().test();

/*
var a = demo.account.Account.create();

// Both Pass
a.setStatus(true);
a.deposit(100);
*/