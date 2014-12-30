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

], Question).dao;
