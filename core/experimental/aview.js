/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        this.$.querySelector('.f1').style.left = l;
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
        if ( ! this.$ ) return;
        var f1$ = this.$.querySelector('.f1');
        var f2$ = this.$.querySelector('.f2');

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
