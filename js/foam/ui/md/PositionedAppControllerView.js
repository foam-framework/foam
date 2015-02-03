CLASS({
  name: 'PositionedAppControllerView',
  package: 'foam.ui.md',
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'DetailView',

  requires: [ 'CanvasScrollView', ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; }, this.layout);
    },
    toInnerHTML: function() {
      this.destroy();
      var out = "";
      var renderer = FOAM.lookup(this.data.citationRenderer, this.X);

      var view = this.filteredDAOView = this.CanvasScrollView({
        dao: this.data.filteredDAO$Proxy,
        renderer: renderer.create({})
      });
      view = view.toPositionedView_();
      out += view.toHTML();
      this.addChild(view);
      return out;
    },
    initHTML: function() {
      this.SUPER();
      this.layout();
    }
  },

  listeners: [
    {
      name: 'layout',
      code: function() {
        if ( ! this.$ ) return;

        var children = this.children;
        var count = children.length;
        children[0].x = 0;
        children[0].y = 0;
        children[0].z = 0;
        children[0].width = this.width;
        children[0].height = this.height;
      }
    }
  ]
});
