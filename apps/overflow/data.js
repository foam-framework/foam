var questions = JSONUtil.arrayToObjArray(X, [
/*
  {
    id: 0,
    title: '',
    labels: [ 'class', 'package', 'namespace' ],
    question: function() {/*
    *},
    answer: function() {/*
    *},
  },
*/
  {
    id: 0,
    title: 'I don\'t have permission to ask a question on the newsgroup.',
    labels: [ 'overflow' ],
    answer: 'You must joing the foam-framework-discuss group before it will let you post messages / questions.'
  },
  {
    id: 1,
    title: 'How do I make my Models not go in the global namespace?',
    labels: [ 'class', 'package', 'namespace' ],
    question: function() {/*
    */},
    answer: function() {/*
      Specify their 'package'.

      Ex.
      CLASS({
        name: 'MyModel',
        <b>package: 'com.somedomain.myApp.somepackage'</b>
      });

      Is now accessed as com.somedomain.myApp.somepackage.MyModel.
      However, you would typically list this Model in the 'requires' list of Models that use it, so that you don't need to specify the full path.

      Ex.
      CLASS({
        name: 'MyOtherModel',
        requires: [
          'com.somedomain.myApp.somepackage.MyModel',           // makes avaialable as 'this.MyModel'
          'com.somedomain.myApp.somepackage.MyModel as AnAlias' // makes avaialable as this.AnAlias
        ]
      });
    */},
  },
  {
    id: 2,
    title: 'My dynamic function which depends on multiple values isn\'t updating properly.',
    labels: [ 'action', 'dynamicFn', 'reactive' ],
    question: function() {/*
    */},
    answer: function() {/*
 Reactive functions, like isAvailable and isEnabled, need to be coded so that you call all of your dependencies every time.  So instead of doing:

<code>
return value1 && value2;
</code>
or:
<code>
return value1 || value2;
</code>
or
<code>
return value1 ? value2 : value3;
</code>
you do something like:
<code>
var v1 = value1;
var v2 = value2;

return v1 && v2;  (or v1 || v2, or whatever your expression is).
</code>

This is because FOAM will track all of the values that  you use in your expression to update it when any of those values change.  But if you do value1 && value2 and value1 is false, then value2 will never get called and FOAM won't know that you depend on it once value1 changes to true.
    */},
  },
  {
    id: 3,
    title: 'How do I discover errors in my models or templates.',
    labels: [ 'error', 'template', 'model' ],
    question: function() {/*
    */},
    answer: function() {/*
    Keep the developer console open as many errors are reported to the console.  Depending on your OS, you can open the developer tools with either F12 or Shift-Ctrl-J.
    */},
  },
  {
    id: 4,
    title: 'Where can I find FOAM API documentation?',
    labels: [ 'documentation', 'api' ],
    question: function() {/*
    */},
    answer: function() {/*
      <a href="http://foam-framework.github.io/foam/foam/apps/docs/docbrowser.html">http://foam-framework.github.io/foam/foam/apps/docs/docbrowser.html</a>
    */},
  },
  {
    id: 5,
    title: 'Where do I report/browse FOAM issues?',
    labels: [ 'issue', 'bug', 'report' ],
    question: function() {/*
    */},
    answer: function() {/*
      <a href="http://issues.foamdev.com">http://issues.foamdev.com</a>
    */},
  },
  {
    id: 6,
    title: 'Where do I put my CSS?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
      You have a number of options: <ol>
        <li>With your regular CSS</li> You can store your CSS in &lt;style&gt; blocks or or in external .css files, just as you normally would.
        <li>Internal FOAM Templates</li> You can create a special FOAM template named 'CSS' which will automatically get installed into your document. Ex.
        <code>
          CLASS({
            name: 'MyView',
            templates: [
              function CSS() {&#47;*
                someSelector {
                  ...
                }
                ...
              *&#47;}
            ],
            ...
          });
        </code>
        <li>External FOAM Templates</li> You can exclude the template body from your Model and then store the template in an external file.
        <code>
          CLASS({
            name: 'MyView',
            templates: [
              { name: 'CSS' }
            ],
            ...
          });
        </code>
        Then put your CSS in an external file named 'MyView_CSS.ft'.  This applies to all templates, not just CSS.  In general, if you don't include the template body in the Model, then FOAM will look in an external file named: ModelName_TemplateName.ft.
      </ol>
    */},
  },
  {
    id: 7,
    title: 'Why can\'t I include instance variables in my CSS templates?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
CSS is static, ie. it's defined on the Model, not on the instance, so that it's installed in the document only once.  As such, it doesn't have access to instance variables.
    */},
  },
  {
    id: 8,
    title: 'How do I dynamically set the CSS class of an element?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
    The View Model has the following method:
    <code>setClass(className, predicate, opt_id)</code>
    which can be used to dynamically set the class of an element.
    The argument 'predicate' is a reactive function and 'className' will be added when it returns true and removed when it returns false. If opt_id is supplied, then a new unique id will be generated.  This lets you inline calls to setClass when setting an element's id.  Ex.
    <code>
      &lt;span id="&lt;%= this.setClass('active', function() { return this.data.degreesMode; }) %>"&gt;DEG&lt;/span&gt;</code>
    */},
  },
  {
    id: 9,
    title: 'Can I store my tempates in their own files rather than embedded in Models?',
    labels: [ 'template' ],
    question: function() {/*
    */},
    answer: function() {/*
        Yes, just exclude the template body and store the template in an external file named: 'MyModel_MyTemplate.ft'.  The 'ft' extension stands for 'FOAM Template'.
        <code>
          CLASS({
            name: 'MyModel',
            templates: [
              { name: 'MyTemplate' }
            ],
            ...
          });
        </code>
    */},
  },
  {
    id: 10,
    title: 'Can I get my editor to provide syntax highlighting for FOAM templates?',
    labels: [ 'template', 'editor' ],
    question: function() {/*
    */},
    answer: function() {/*
      Store your templates in an external file (see Q9) and then put your editor into Java Server Pages (JSP) mode. FOAM reuses JSP syntax. JSP's are a very common templating syntax and are supported by most popular editors.
    */},
  },
  {
    id: 11,
    title: 'What does FOAM stand for?',
    labels: [ 'general' ],
    question: function() {/*
    */},
    answer: function() {/*
      Feature-Oriented Active Modeller.  Feature-Oriented refers to the way that FOAM's meta-model is implemented and extended.  Current features include: properties, methods, actions, templates, listeners, etc., but new features can be added to meet your modelling needs.  "Modeller" refers to the fact that FOAM is Model-Oriented and "Active" denotes that FOAM maintains your Models at runtime, ie. they're still active and available for runtime inspection.  They aren't static / don't disappear after compile-time.
    */},
  },
  {
    id: 12,
    title: 'What is "Reactive Programming"?',
    labels: [ 'general' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },
  {
    id: 13,
    title: 'OR or IN operation in IndexedDB?',
    labels: [ 'indexeddb', 'dao' ],
    src: 'http://stackoverflow.com/questions/22419703/or-or-in-operation-in-indexeddb',
    question: function() {/*
      Is there a way to do an OR or IN query on the same property in IndexedDB?

In other words, how do I get the results for:

<code>SELECT * FROM MyTable WHERE columnA IN ('ABC','DFT') AND columnB = '123thd'</code>
    */},
    answer: function() {/*
The following code implements your question:

<code>
// Test IN and EQ

// Define Your Table Structure
CLASS({
  name: 'MyTable',
  properties: [ 'id', 'columnA', 'columnB' ]
});

// Build an IndexedDB table, with auto-seqNo and caching support
var MyTableDAO = X.lookup('foam.dao.EasyDAO').create({model: MyTable, seqNo: true, daoType: 'foam.dao.IDBDAO', cache: true});

// Populate some test data
[
  MyTable.create({columnA: 'ABC', columnB: '123thd'}),
  MyTable.create({columnA: 'DFT', columnB: '123thd'}),
  MyTable.create({columnA: 'XYZ', columnB: '123thd'}),
  MyTable.create({columnA: 'ABC', columnB: '124thd'}),
  MyTable.create({columnA: 'DFT', columnB: '124thd'}),
  MyTable.create({columnA: 'XYZ', columnB: '124thd'})
].select(MyTableDAO);

// Perform your Query
MyTableDAO.
  where(AND(
    IN(MyTable.COLUMN_A, ['ABC', 'DFT']),
    EQ(MyTable.COLUMN_B, '123thd'))).
  select(function(mt) {
    console.log(mt.toJSON());
});
</code>

Output:
<code>
{
   model_: "MyTable",
   "id": 139,
   "columnA": "ABC",
   "columnB": "123thd"
}
{
   model_: "MyTable",
   "id": 140,
   "columnA": "DFT",
   "columnB": "123thd"
}
</code>

This solution isn't IndexedDB specific and works with any DAO type.
    */},
  },

  {
    id: 14,
    title: 'How do make a sorted compound query?',
    src: 'http://stackoverflow.com/questions/12084177/in-indexeddb-is-there-a-way-to-make-a-sorted-compound-query',
    labels: [ 'indexeddb', 'dao' ],
    question: function() {/*
Say a table has, name, ID, age, sex, education, etc. ID is the key and the table is also indexed for name, age and sex. I need all male students, older than 25, sorted by their names.

This is easy in mySQL:

<code>
    SELECT * FROM table WHERE age > 25 AND sex = "M" ORDER BY name
</code>
IndexDB allows creation of an index and orders the query based on that index. But it doesn't allow multiple queries like age and sex. I found a small library called queryIndexedDB (https://github.com/philikon/queryIndexedDB) which allows compound queries but doesn't provide sorted results.

So is there a way to make a sorted compound query, while using IndexedDB?
    */},
    answer: function() {/*
The following code implements your question:

<code>
CLASS({
  name: 'Person',
  properties: [
    { name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { type: 'Int', name: 'age' }
  ]
});

// Create an IndexedDB table with sequence no generation and caching.
var dao = X.lookup('foam.dao.EasyDAO').create({model: Person, seqNo: true, daoType: 'foam.dao.IDBDAO', cache: true});

// Add some test data.
[
  Person.create({id:'5', name:'John',  age:28, sex:'M'}),
  Person.create({id:'6', name:'Daniel',age:29, sex:'F'}),
  Person.create({id:'7', name:'Sam',   age:20, sex:'M'}),
  Person.create({id:'8', name:'Allan', age:26, sex:'M'}),
  Person.create({id:'9', name:'Kim',   age:18, sex:'F'}),
].select(dao);


// SELECT * FROM table WHERE age > 25 AND sex = "M" ORDER BY name
dao.where(AND(GT(Person.AGE, 25), Person.SEX = 'M')).orderBy(Person.NAME).select(function(p) {
  console.log(p.toJSON());
});

// Cleanup Data when done.
dao.removeAll();
<code>

Output:
<code>
{
   model_: "Person",
   "id": "8",
   "name": "Allan",
   "sex": "M",
   "age": 26
}
{
   model_: "Person",
   "id": "6",
   "name": "Daniel",
   "sex": "F",
   "age": 29
}
{
   model_: "Person",
   "id": "5",
   "name": "John",
   "sex": "M",
   "age": 28
}
</code>

This solution isn't IndexedDB specific and works with any DAO type.
    */},
  },
  {
    id: 15,
    title: 'Universal search in IndexedDB',
    labels: [ 'indexeddb', 'dao' ],
    question: function() {/*
I want:

SQL - Select id from tabla Where x='jon' or y='jon'

data:
  id, x , y
  1, johnny, olivas
  2, jonas, torres
  3, jon, jonatis
  4, alc, jonhson

result = 2, 3, 4

but using indexedDB
    */},
    answer: function() {/*
The following code implements your question:
<code>
CLASS({
  name: 'Tabla',
  properties: [ 'id', 'a', 'b' ]
});

// Create an IndexedDB table with caching.
var dao = X.lookup('foam.dao.EasyDAO').create({model: Tabla, daoType: 'foam.dao.IDBDAO', cache: true});

// Add your test data.
[
  Tabla.create({id: 1, a: 'johnny', b: 'olivas'}),
  Tabla.create({id: 2, a: 'jonas',  b: 'torres'}),
  Tabla.create({id: 3, a: 'jon',    b: 'jonatis'}),
  Tabla.create({id: 4, a: 'alc',    b: 'jonhson'})
].select(dao);

// Select id from tabla Where a='jon' or b='jon'
// Except that I think you want to search for the string containing 'jon', not
// just equaling it.  You could also use CONTAINS_IC to ignore-case or
// STARTS_WITH to just check for matches at the beginning of the strings.

dao.where(OR(CONTAINS(Tabla.A, 'jon'), CONTAINS(Tabla.B, 'jon'))).select(
  function(t) { console.log(t.id); }
);

// Cleanup Data when done.
dao.removeAll();
</code>

Output:
<pre>
2
3
4
</pre>
This also works:
<code>
dao.where(CONTAINS(SEQ(Tabla.A, Tabla.B), 'jon')).select(
  function(t) { console.log(t.id); });
</code>

This solution isn't IndexedDB specific and works with any DAO type.
    */},
  },
  {
    id: 16,
    title: 'How do I emulate super in javascript?',
    labels: [ 'class', 'super', 'OO' ],
    src: 'http://stackoverflow.com/questions/8032566/emulate-super-in-javascript',
    answer: function() {/*
<code>
CLASS({
  name: 'Foo',
  methods: { say: function() { console.log('foo'); } }
});

CLASS({
  name: 'Bar',
  extends: 'Foo',
  properties: [ { type: 'Int', name: 'counter' } ],
  methods: {
    say: function() {
      this.SUPER();
      this.counter++;
      console.log('bar ' + this.counter);
    }
  }
});

var foo = Foo.create();
var bar = Bar.create();

foo.say();
  foo

bar.say();
  foo
  bar 1

bar.say();
  foo
  bar 2
</code>
    */},
  },

], Question).dao;
