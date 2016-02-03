/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Tests:

CLASS({
  name: 'GetterSetterTest',
  properties: [
    {
      name: 'b'
    },
    {
      name: 'a',
      getter: function()  { console.log('getter'); return this.b; },
      setter: function(a) { console.log('setter'); this.b = a; }
    },
    'c'
  ]
});
var t = GetterSetterTest.create({});
t.a = 42;
console.assert(t.a == 42, 'Getter/setter doesn\'t work.');
t.c = 88;
console.assert(t.c == 88, 'Short-form property doesn\'t work.');


CLASS({
  name: 'FactoryTest',
  properties: [
    {
      name: 'a',
      factory: function() { return 42; }
    }
  ]
});
var ft = FactoryTest.create({});
console.assert(ft.a == 42, 'Factories don\'t work.');
ft.a = 84;
console.assert(ft.a == 84, 'Factories don\'t update.');


CLASS({
  name: 'DefaultValue',
  extends: 'FObject',
  properties: [
    {
      name: 'a',
      defaultValue: 42
    }
  ]
});
var dv = DefaultValue.create({});
console.assert(dv.a == 42, 'DefaultValues don\'t work.');
dv.a = 84;
console.assert(dv.a == 84, 'DefaultValues don\'t update.');
dv.clearProperty('a');
console.assert(dv.a == 42, 'clearProperty doesn\'t work.');

// ArrayProperty Test
CLASS({ name: 'A', properties: [ { name: 'a' } ] });
CLASS({
  name: 'B',
  properties: [
    {
      type: 'Array',
      subType: 'A',
      name: 'as'
    }
  ]
});

var b = B.create({as: [{a: 'abc'}]});
console.log(b.as);


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
console.assert(t1.KEY, 'Constants don\'t work.');
console.log(t1.KEY);

CLASS({
  name: 'ConstantTest2',

  constants: {
    KEY:  'If you can see this, short-syntax Constants are working!',
    KEY2: 'And again'
  }
});

var t2 = ConstantTest2.create({});
console.assert(t2.KEY, 'Constants don\'t work with map syntax.');
console.assert(t2.KEY2, 'Constants don\'t work with map syntax.');
console.log(t2.KEY, t2.KEY2);


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

var p = Person.create({name: 'Adam', age: 18});
console.log(p.name, p.age, p.KEY);
p.sayHello();
p.sayGoodbye();

console.assert(p.toString() === 'Person', 'Instance toString() incorrect.');
console.assert(Person.toString() === 'PersonClass', 'Instance toString() incorrect.');
console.assert(Person.prototype.toString() === 'PersonProto', 'Instance toString() incorrect.');


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

console.assert(Person.isSubClass(Employee), 'isSubClass false negative.');
console.assert(!Employee.isSubClass(Person), 'isSubClass false positive.');
console.assert(! Person.isSubClass(ConstantTest), 'isSubClass false positive.');

console.assert(Person.isInstance(p), 'isInstance false negative.');
console.assert(!Employee.isInstance(p), 'isInstance false positive.');
console.assert(Person.isInstance(e), 'isInstance false negative.');
console.assert(! Person.isInstance(t1), 'isInstance false positive.');

console.assert(Person.getAxiomByName('age') === Person.AGE, 'Class.getAxiomByName() doesn\'t work.');

var axs = Person.getAxiomsByClass(Property);
console.assert(axs.length == 2 && axs[0] === Person.NAME && axs[1] === Person.AGE, 'Class.getAxiomsByClass() doesn\'t work.');
console.assert(Person.getAxioms().length === 6, 'Missing axiom from getAxioms().');

/*
// 3058ms, Jan 26, 2016, X1 Carbon
// 2727ms, Feb  1, "     "
console.time('b1');
for ( var i = 0 ; i < 10000000 ; i++ )
  p.age++;
console.timeEnd('b1');

// 1251ms, Jan 26, 2016, X1 Carbon
// 2700ms, Feb  1, "     "
// 1735ms, Feb  1, "     "
console.time('b2');
for ( var i = 0 ; i < 1000000 ; i++ )
  Person.create({name: 'john', age: i});
console.timeEnd('b2');
*/
