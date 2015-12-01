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
  package: 'foam.ui.md',
  name: 'PositionedAppControllerView',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
  extends: 'foam.ui.DetailView',

  requires: [ 'foam.graphics.CanvasScrollView' ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamicFn(function() { self.width; self.height; }, this.layout);
    },
    toInnerHTML: function() {
      this.destroy();
      var out = "";
      var renderer = this.Y.lookup(this.data.citationRenderer);

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
