CLASS({
  name: 'EditView',
  package: 'foam.tools',
  extendsModel: 'foam.ui.View',
  properties: [
    {
      name: 'modelName',
      postSet: function() {
        arequire(this.modelName)(function(m) {
          this.model = m
        }.bind(this));
      }
    },
    {
      name: 'model',
      postSet: function() {
        this.view = this.model.create();
      }
    },
    {
      name: 'view',
      view: 'foam.ui.DetailView',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*<%= this.view %><br>$$view*/}
  ]
});
