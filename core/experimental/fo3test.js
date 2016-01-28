// Tests:

debugger;

CLASS({
  name: 'ConstantTest',

  constants: [
    {
      name: 'KEY',
      value: 'If you can see this, Constants are working!'
    }
  ]
});

var t1 = ConstantTest.create({});
console.log(p.KEY);


CLASS({
  name: 'Person',

  constants: [
    {
      name: 'KEY',
      value: 'If you can see this, Constants are working!'
    }
  ],

  properties: [
    {
      name: 'name'
    },
    {
      name: 'age'
    }
  ],

  methods: [
    {
      name: 'sayHello',
      code: function() { console.log('Hello World!'); }
    },
    function sayGoodbye() { console.log('Goodbye from ' + this.name); }
  ]
});

var p = Person.create({name: 'Adam', age: 0});
console.log(p.name, p.age, p.KEY);
p.sayHello();
p.sayGoodbye();


CLASS({
  name: 'Employee',
  extends: 'Person',
  
  properties: [
    {
      name: 'salary'
    }
  ],

  methods: [
    function toString() {
      return this.cls_.name + '(' + this.name + ', ' + this.age + ', ' + this.salary + ')';
    }
  ]
});

var e = Employee.create({name: 'Jane', age: 30, salary: 50000});
console.log(e.toString());
e.sayGoodbye();

/*
// 3058ms, Jan 26, 2016, X1 Carbon
console.time('b1');
for ( var i = 0 ; i < 10000000 ; i++ )
  p.age++;
console.timeEnd('b1');


// 1251ms, Jan 26, 2016, X1 Carbon
console.time('b2');
for ( var i = 0 ; i < 1000000 ; i++ )
  Person.create({name: 'john', age: i});
console.timeEnd('b2');
*/
