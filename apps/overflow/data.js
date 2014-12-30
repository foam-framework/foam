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
        package: 'com.somedomain.myApp.somepackage'
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
    title: 'Where do I put my CSS?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },
  {
    id: 6,
    title: 'Why can\'t I include instance variables in my CSS templates?',
    labels: [ 'template', 'css' ],
    question: function() {/*
    */},
    answer: function() {/*
    */},
  },

], Question).dao;
