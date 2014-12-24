CLASS({
  package: 'foam.graphics',
  name: 'CViewView',
  extendsModel: 'foam.graphics.AbstractCViewView',
  help: 'DOM wrapper for a CView, auto adjusts it size to fit the given cview.',
  documentation: function() {/*
      DOM wrapper for a $$DOC{ref:'foam.graphics.CView'}, that auto adjusts it size to fit
      he given view.
    */},
  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
        this.X.dynamic(function() {
          this.width  = cview.x + cview.width;
          this.height = cview.y + cview.height;
        }.bind(this));
      }
    }
  ]
});
