var stack = X.StackView.create();

MODEL({
  name: 'RefTable',

  properties: [
    {
      name: 'id'
    }
  ]
});

var dao = ['ab','bb','cb','db','eb','fb','gb','hb','ib', 'aa','ba','ca','da','ea','fa','ga','ha','ia'].map(function(d) { return RefTable.create({id: d}); });

/*
MODEL({
  name: 'TestCompleter',
  properties: [
    { model_: 'DAOProperty', name: 'autocompleteDao' }
  ],
  methods: {
    autocomplete: function(data) {
      var src = this.X.PersonDAO;
      var dao = src.where(
        data ?
          STARTS_WITH_IC(IssuePerson.NAME, data) :
          TRUE);

      var self = this;
      dao.limit(2).select()(function(objs) {
        if ( objs.length === 1 && self.f(objs[0]) === data ) {
          self.autocompleteDao = src.where(FALSE);
        } else {
          self.autocompleteDao = dao;
        }
      });
    },
    f: function(o) { return o.name; }
  }
});
*/

MODEL({
  name: 'Test',

  properties: [
    {
      name: 'f1',
      factory: function() { return ['a', 'b', 'c']; },
      view: {
        model_: 'mdStringArrayView',
        autoCompleteDAO: dao,
        autoCompleteQueryFactory: function(data) {
          return STARTS_WITH_IC(RefTable.ID, data);
        }
      }
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