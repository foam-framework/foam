/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.ui',
  name: 'ArrayTileView',

  extends: 'foam.ui.AbstractDAOView',

  properties: [
    {
      name: 'property'
    },
    {
      name: 'tileView'
    },
    {
      name: 'lastView'
    },
    {
      type: 'Boolean',
      name: 'painting',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      this.on('click', this.onClick, this.id);

      return '<ul id="' + this.id + '" class="arrayTileView"><li class="arrayTileLastView">' +
        this.lastView.toHTML() + '</li></ul>';
    },
    initHTML: function() {
      this.SUPER();

      this.lastView.initHTML();
      this.paint();
      this.$.ownerDocument.defaultView.addEventListener('resize', this.layout);
    },
  },

  listeners: [
    {
      // Clicking anywhere in the View should give focus to the
      // lastView.
      name: 'onClick',
      code: function() { this.lastView.focus(); }
    },
    {
      name: 'layout',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        var last = this.$.lastChild;
        last.style.width = '100px';
        last.style.width = 100 + last.parentNode.clientWidth -
          (last.offsetWidth + last.offsetLeft) - 4 /* margin */ - 75;
        this.painting = false;
      }
    },
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        // If we're currently painting, don't actually paint now,
        // queue up another paint on the next animation frame.
        // This doesn't spin infinitely because paint is set to framed: true,
        // meaning that it's merged to the next animation frame.
        if ( this.painting ) {
          this.paint();
          return;
        }

        this.painting = true;
        this.children = [];
        var value = this.data;
        var count = value.length;
        var self  = this;
        var render = function() {
          while ( self.$.firstChild !== self.$.lastChild ) {
            self.$.removeChild(self.$.firstChild);
          }

          var temp = document.createElement('div');
          temp.style.display = 'None';
          self.$.insertBefore(temp, self.$.lastChild);
          temp.outerHTML = self.children.map(
            function(c) { return '<li class="arrayTileItem">' + c.toHTML() + '</li>'; }).join('');
          self.children.forEach(
            function(c) { c.initHTML(); });
          self.layout();
        };

        if ( value.length == 0 ) {
          render();
        } else {
          self.$.style.display = '';
        }

        for ( var i = 0; i < value.length; i++ ) {
          this.dao.find(EQ(this.property, value[i]), {
            put: function(obj) {
              var view = self.tileView.create();
              view.data = obj;
              view.subscribe('remove', self.onRemove);
              self.addChild(view);
              count--;
              if ( count == 0 ) render();
            },
            error: function() {
              // Ignore missing values
              count--;
              if ( count == 0 ) render();
            },
          });
        }
      }
    },
    {
      name: 'onRemove',
      code: function(src, topic, obj) {
        var self = this;
        this.data = this.data.removeF({
          f: function(o) {
            return o === self.property.f(obj);
          }
        });
      }
    }
  ]
});
