FOAModel({
  name: 'DoubleClickWrapper',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'view'
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        this.view.value = nu;
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      this.on('dblclick', this.onDoubleClick, this.getID());
      return this.view.toHTML();
    },
    initInnerHTML: function() {
      this.SUPER();
      this.view.initHTML();
    },
  },

  listeners: [
    {
      name: 'onDoubleClick',
      code: function() {
        this.publish('nextview');
      }
    }
  ]
});

var view = ViewSwitcher.create({
  views: [
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view1' })
    }),
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view2' })
    }),
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view3' })
    }),
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view4' })
    }),
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view5' })
    }),
    DoubleClickWrapper.create({
      view: TextFieldView.create({ placeholder: 'view6' })
    })
  ]
});

view.write(document);
