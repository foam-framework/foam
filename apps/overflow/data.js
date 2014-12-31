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
    labels: [ 'action', 'dynamic', 'reactive' ],
    question: function() {/*
    */},
    answer: function() {/*
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
    */},
  },
  {
    id: 7,
    title: 'Why can\'t I include instance variables in my CSS templates?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },
  {
    id: 8,
    title: 'How do I dynamically set the CSS class of an element?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },
  {
    id: 9,
    title: 'Can I store my tempates in their own files rather than embedded in Models?',
    labels: [ 'template' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },
  {
    id: 10,
    title: 'Can I get my editor to provide syntax highlighting for FOAM templates?',
    labels: [ 'template', 'editor' ],
    question: function() {/*
    */},
    answer: function() {/*
      Store your templates in an external file (see Q9) and then put your editor into Java Server Pages (JSP) mode.
      FOAM reuses JSP syntax.
      JSP's are a very common templating syntax and are supported by most popular editors.
    */},
  },
  {
    id: 11,
    title: 'What does FOAM stand for?',
    labels: [ 'general' ],
    question: function() {/*
    */},
    answer: function() {/*
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

<code>
SELECT * FROM MyTable WHERE columnA IN ('ABC','DFT') AND columnB = '123thd'
</code>
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
var MyTableDAO = EasyDAO.create({model: MyTable, seqNo: true, daoType: 'IDBDAO', cache: true});

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
   "model_": "MyTable",
   "id": 139,
   "columnA": "ABC",
   "columnB": "123thd"
}
{
   "model_": "MyTable",
   "id": 140,
   "columnA": "DFT",
   "columnB": "123thd"
}
<?code>
    */},
  },


], Question).dao;
