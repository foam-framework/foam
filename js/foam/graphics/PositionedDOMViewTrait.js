CLASS({
  package: 'foam.graphics',
  name: 'PositionedCViewView',
  extendsModel: 'foam.graphics.AbstractCViewView',
  traits: ['PositionedDOMViewTrait'],
  properties: [
    {
      name: 'tagName',
      factory: function() { return 'canvas'; }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() {
        this.cview; this.width; this.height;
      }.bind(this), function() {
        if ( ! this.cview ) return;
        this.cview.width = this.width;
        this.cview.height = this.height;
      }.bind(this));
    },
    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" ' + this.layoutStyle() + '></canvas>';
    }
  },
  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width = this.canvasWidth();
        this.$.style.width = this.styleWidth();
        this.$.height = this.canvasHeight();
        this.$.style.height = this.styleHeight();
        this.cview.width = this.width;
        this.cview.height = this.height;
        this.paint();
      }
    }
  ]
});
