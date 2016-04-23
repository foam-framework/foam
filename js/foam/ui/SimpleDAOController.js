CLASS({
  name: 'SimpleDAOController',
  package: 'foam.ui',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.TableView',
  ],
  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'data',
      hidden: true,
    },
    {
      name: 'daoView',
      lazyFactory: function() {
        var view = this.TableView.create({
          data: this.data,
          scrollEnabled: true,
          editColumnsEnabled: true, 
        });
        return view
      },
      postSet: function(o, n) {
        if (o) o.hardSelection$.removeListener(this.onHardSelection);
        if (n) n.hardSelection$.addListener(this.onHardSelection);
      },
    },
    {
      name: 'selection',
      view: 'foam.ui.DetailView',
      lazyFactory: function() {
        return this.data.model.create();
      },
    },
  ],
  actions: [
    {
      name: 'save',
      code: function() {
        this.data.put(this.selection.clone());
        this.selection = this.data.model.create();
      },
    },
    {
      name: 'deleteSelected',
      code: function() {
        this.data.remove(this.selection);
        this.selection = this.data.model.create();
      },
    },
    {
      name: 'deleteAll',
      code: function() {
        this.data.removeAll();
        this.selection = this.data.model.create();
      },
    },
  ],
  listeners: [
    {
      name: 'onHardSelection',
      code: function() {
        this.selection = this.daoView.hardSelection.clone();
      },
    },
  ],
  templates: [
    function toHTML() {/*
      <div style="height: 300px; overflow: hidden;">
        %%daoView
      </div>
      $$deleteAll
      $$selection
      $$save
      $$deleteSelected
    */},
  ]
});
