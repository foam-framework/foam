// Experimental Animated Views

MODEL({
  name: 'ALabel',

  extendsModel: 'View',

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
        this.el.querySelector('.f1').style.left = l;
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      return '<div style="position:absolute;transition: left .3s ease;" class="f1"></div><div style="display:inline;visibility:hidden;" class="f2"></div>';
    },
    initHTML: function() {
      this.data$.addListener(this.onDataChange);
    }
  },

  listeners: [
    {
      name: 'onDataChange',
//      isFramed: true, // interferes with CSS animation
      code: function() {
        if ( ! this.el ) return;
        var f1$ = this.el.querySelector('.f1');
        var f2$ = this.el.querySelector('.f2');

        f1$.innerHTML = this.data;
        f2$.innerHTML = this.data;

        f1$.style.top  = f2$.offsetTop;
        f1$.style.left = f2$.offsetLeft;
      }
    }
  ]
});


MODEL({
  name: 'AImageView',

  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function() { this.onDataChange(); }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.el ) {
          this.el.style.width = newValue;
        }
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.el ) {
          this.el.style.height = newValue;
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
        if ( ! this.el ) return;
        var $ = this.el;
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
