CLASS({
  package: 'foam.ui.animated',
  name: 'ImageView',

  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function() { this.onDataChange(); }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.width = newValue;
        }
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.height = newValue;
        }
      }
    },
    {
      name: 'className',
      defaultValue: 'aImageView'
    }
  ],

  listeners: [
    {
      name: 'onDataChange',
      code: function() {
        if ( ! this.$ ) return;
        var $ = this.$;
        var height = $.querySelector('img').height;
        var newImage = '<img ' + this.cssClassAttr() + ' src="' + this.data + '" style="position: absolute;transition:top .4s;top:' + height + '">';
        $.insertAdjacentHTML('beforeend', newImage);
        var vs = $.querySelectorAll('img');
        if ( vs.length == 3 ) vs[0].remove();
        setTimeout(function() {
          vs[vs.length-2].style.top = '-' + height +'px';
          vs[vs.length-1].style.top = 0;
        }, 1);
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.displayHeight = this.displayHeight;
      this.displayWidth = this.displayWidth;
    },
    toHTML: function() {
      return '<span id="' + this.id + '"><img ' + this.cssClassAttr() + ' src="' + this.data + '" style="position: absolute;transition:top .4s;top:0"></span>' ;
    }
  }
});
