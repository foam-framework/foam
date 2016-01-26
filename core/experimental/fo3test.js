// Tests:

CLASS({
  name: 'Person',

  constants: [
    {
      name: 'KEY',
      value: 'value'
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
