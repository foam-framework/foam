DEBUG = true;

FOAModel({
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
      },
      args: [
        { model_: 'Arg', type: 'boolean' }
      ]
    },
    {
      name: "deposit",
      code: function (amount) {
        this.balance += amount;

        return this.balance;
      },
      args: [
        { type: 'number' }
      ],
      returnType: 'number',
    },
    {
      name: "withdraw",
      code: function (amount) {
        this.balance -= amount;

        return this.bal;
      },
      args: [
        { type: 'number' }
      ],
      returnType: 'number'
    }
  ]

});

var a = Account.create();

// Both Pass
a.setStatus(true);
a.deposit(100);

// Both Fail
a.deposit('gold coins');
a.withdraw(50);
