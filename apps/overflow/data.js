var questions = JSONUtil.arrayToObjArray(X, [
/*  {
    id: 0,
    questionTitle: '',
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
  }
], Question).dao;
