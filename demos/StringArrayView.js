var stack = X.StackView.create();

var dao = ['a','b','c','d','e','f','g','h','i'];

MODEL({
  name: 'Test',

  properties: [
    {
      name: 'f1',
      factory: function() { return ['a', 'b', 'c']; },
      view: { model_: 'mdStringArrayView', autoCompleteDAO: dao }
    }
  ],
  templates: [
    function toDetailHTML() {/* <div id="%%id"> $$f1 </div> */} 
  ]
});

var test = Test.create();
var view = DetailView.create({data: test});

stack.write(document);
stack.setTopView(FloatingView.create({view: view}));