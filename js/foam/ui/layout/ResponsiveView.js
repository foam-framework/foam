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

CLASS({
  package: 'foam.ui.layout',
  name: 'ResponsiveView',
  extends: 'foam.ui.View',
  requires: [
    'foam.ui.layout.ResponsiveViewOption'
  ],
  imports: ['window'],
  properties: [
    {
      type: 'Array',
      subType: 'foam.ui.layout.ResponsiveViewOption',
      name: 'options',
      preSet: function(_, v) {
        return v.slice().sort(toCompare(this.ResponsiveViewOption.MIN_WIDTH));
      }
    },
    {
      name: 'current',
      subType: 'foam.ui.layout.ResponsiveViewOption',
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
    initInnerHTML: function() {
      this.SUPER();
      this.window.addEventListener('resize', this.onResize);
      this.onResize_();
    },
    destroy: function(isParentDestroyed) {
      this.SUPER(isParentDestroyed);
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
    function toInnerHTML() {/*<% this.destroy(); %><%= this.current ? this.current.controller({ data$: this.data$ }) : '' %>*/}
  ]
});
