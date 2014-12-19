CLASS({
  package: 'foam.ui.layout',
  name: 'ResponsiveView',
  extendsModel: 'View',
  requires: [
    'foam.ui.layout.ResponsiveViewOption'
  ],
  imports: ['window'],
  properties: [
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.layout.ResponsiveViewOption',
      name: 'options',
      preSet: function(_, v) {
        return v.slice().sort(toCompare(this.ResponsiveViewOption.MIN_WIDTH));
      }
    },
    {
      name: 'current',
      type: 'foam.ui.layout.ResponsiveViewOption',
      postSet: function(old, v) {
        if ( old !== v ) this.updateHTML();
      }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.window.addEventListener('resize', this.onResize);
      this.onResize_();
    },
    destory: function() {
      this.window.removeEventListener('resize', this.onResize);
    },
    onResize_: function() {
      if (!this.$) return;

      var width = this.$.clientWidth;

      for (var i = 0; i < this.options.length; i++) {
        var option = this.options[i];
        if ( option.minWidth > width ) break;
      }
      i = Math.max(i - 1, 0);

      this.current = this.options[i];
    }
  },
  listeners: [
    {
      name: 'onResize',
      isMerged: 100,
      code: function() {
        this.onResize_();
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*<%= this.current ? this.current.controller() : '' %>*/}
  ]
});
