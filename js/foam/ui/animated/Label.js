CLASS({
  package: 'foam.ui.animated',
  name: 'Label',

  extendsModel: 'View',

  imports: [ 'window' ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'alabel'
    },
    {
      name: 'left',
      postSet: function(_, l) {
        this.$.querySelector('.f1').style.left = l;
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      return '<div class="f1"></div><div class="f2"></div>';
    },
    initHTML: function() {
      this.data$.addListener(this.onDataChange);
      this.window.addEventListener('resize', this.onResize);
    }
  },

  templates: [
    function CSS() {/*
      .f1 {
        position: absolute;
        white-space: nowrap;
      }
      .f1.animated {
        transition: left .3s ease;
      }
      .f2 {
        display: inline;
        float: right;
        visibility: hidden;
        white-space: nowrap;
      }
    */}
  ],

  listeners: [
    {
      name: 'onDataChange',
//      isFramed: true, // interferes with CSS animation
      code: function() {
        if ( ! this.$ ) return;
        var f1$ = this.$.querySelector('.f1');
        var f2$ = this.$.querySelector('.f2');

        f1$.innerHTML = this.data;
        f2$.innerHTML = this.data;

//        f1$.style.top  = f2$.offsetTop;
        f1$.style.left = f2$.offsetLeft;
        DOM.setClass(this.$.querySelector('.f1'), 'animated', true);
      }
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        DOM.setClass(this.$.querySelector('.f1'), 'animated', false);
        this.onDataChange();
      }
    }
  ]
});
