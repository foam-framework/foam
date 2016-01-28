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
      return this.model_.name + '(' + this.name + ', ' + this.age + ', ' + this.salary + ')';
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
