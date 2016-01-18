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
  package: 'foam.browser.u2',
  name: 'StackView',
  extends: 'foam.u2.Element',

  imports: [
    'dynamic',
    'requestAnimationFrame',
    'setTimeout',
    'window'
  ],

  exports: [
    'as stack'
  ],

  properties: [
    {
      name: 'maxVisibleViews',
      type: 'Int',
      defaultValue: 2,
      documentation: 'Limits the number of views on screen at a time.',
    },
    {
      name: 'views_',
      documentation: 'Internal array of child views.',
      factory: function() {
        return [];
      }
    },
    {
      name: 'visibleStart_',
      documentation: 'The index of the leftmost visible element.',
      defaultValue: 0
    },
    {
      name: 'visibleEnd_',
      documentation: 'The index of the rightmost visible element.',
      defaultValue: 0
    },
    {
      name: 'noDecoration',
      type: 'Boolean',
      documentation: 'Set true to hide panel edges.',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'transition',
      documentation: 'Transition to use when adding or removing a view.',
      defaultValue: 'slide',
      choices: ['slide', 'fade']
    },
    {
      name: 'defaultMinWidth',
      documentation: 'If an item in the stack does not define a minWidth property, this value is used instead.',
      defaultValue: 300
    },
    {
      name: 'defaultPreferredWidth',
      documentation: 'If an item in the stack does not define a preferredWidth property, this value is used instead.',
      defaultValue: 400
    },
    {
      name: 'defaultMaxWidth',
      documentation: 'If an item in the stack does not define a maxWidth property, this value is used instead.',
      defaultValue: 10000
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.window.addEventListener('resize', this.onResize);
    },
    {
      name: 'pushView',
      documentation: 'Default pushView that works at the top level. See ' +
          '$$DOC{ref:".pushView_"} for details.',
      code: function(view, hints) {
        this.pushView_(-1, view, hints);
      }
    },
    {
      name: 'popView',
      documentation: 'Default popView that works at the top level. See ' +
          '$$DOC{ref:".popView_"} for details.',
      code: function() {
        this.popView_(0);
      }
    },
    {
      name: 'popChildViews',
      documentation: 'Default popChildViews that works at the top level. See ' +
          '$$DOC{ref:".popChildViews_"} for details.',
      code: function() {
        this.popView_(1);
      }
    },
    function elementAnimationAdd_(e) {
      if (this.transition === 'slide') {
        e.style({
          width: '0px',
          left: '100%',
          transition: 'left 300ms ease'
        });
      } else if (this.transition === 'fade') {
        e.style({
          opacity: 0,
          transition: 'opacity 300ms ease'
        });
        this.requestAnimationFrame(function() {
          e.style({ opacity: 1 });
        });
      }
      this.publish(['stack-element-push'], e);
    },
    function elementAnimationRemove_(e) {
      if (this.transition === 'slide') {
        e.style({ left: '100%' });
      } else if (this.transition === 'fade') {
        e.style({ opacity: 0 });
      }
    },
    function destroyChildViews_(index) {
      while (this.views_.length > index) {
        var obj = this.views_.pop();
        this.elementAnimationRemove_(obj.panel);
        this.resize();
        this.finishDestroy(obj.panel);
      }
    },
    function finishDestroy(e) {
      this.setTimeout(function() {
        // Clean up after the animation.
        // TODO(braden): Calling destroy() should cause an unload if needed.
        // Once that is true, the unload() call here can be removed.
        e.unload();
        e.destroy();
      }, 1000);
    },
    function renderChild(index) {
      var e = this.childE(index);
      this.views_[index].panel = e;
      this.add(e);
      this.elementAnimationAdd_(e);
    },
    function childE(index) {
      var obj = this.views_[index];
      var self = this;
      var e = this.E('div')
          .cls(this.myCls('panel'))
          .cls(this.dynamic(function(start, end) {
            return index < start - 1 || index > end + 1 ? self.myCls('hidden') : '';
          }, this.visibleStart_$, this.visibleEnd_$))
          .cls(this.dynamic(function(start, end) {
            return index < start || index > end ? self.myCls('no-input') : '';
          }, this.visibleStart_$, this.visibleEnd_$));

      e.add(obj.content);
      e.start('div')
          .cls(this.myCls('edge'))
          .cls(this.myCls('hidden'), this.noDecoration$)
          .end();
      return e;
    },
    function resize() {
      var width = this.el().offsetWidth;
      var index = this.views_.length - 1;
      while (index >= 0 && width >= (this.views_[index].content.minWidth || this.defaultMinWidth)) {
        width -= (this.views_[index].content.minWidth || this.defaultMinWidth);
        index--;
      }

      index = Math.min(index + 1, this.views_.length - 1);
      this.visibleStart_ = Math.max(index, this.views_.length - this.maxVisibleViews);
      // Currently visibleEnd_ is always the last view; it exists only to make
      // sure views that are replacing each other come and go lockstep in a
      // single frame.
      this.visibleEnd_ = this.views_.length - 1;

      // Now, we actually compute the sizes for the containing views.
      // The algorithm here is straightforward. They all have minWidth allocated
      // already. We try to assign each view some extra, up to its preferred
      // width. If there's still some left, we make a second pass, allowing each
      // view more space, up to its maxWidth. If there's still some left, the last
      // view gets it, no matter the maximum.

      if (this.visibleStart_ < 0) return;

      width = this.el().offsetWidth;
      var sizes = [];
      for (var i = this.visibleStart_; i <= this.visibleEnd_; i++) {
        var min = this.views_[i].content.minWidth || this.defaultMinWidth;
        sizes[i] = min; // This leaves blanks for hidden views. Oh well.
        width -= min;
      }

      for (i = this.visibleEnd_; width > 0 && i >= this.visibleStart_; i--) {
        var newSize = Math.min(sizes[i] + width, this.views_[i].content.preferredWidth || this.defaultMinWidth);
        width -= newSize - sizes[i];
        sizes[i] = newSize;
      }

      for (i = this.visibleEnd_; width > 0 && i >= this.visibleStart_; i--) {
        var newSize = Math.min(sizes[i] + width, this.views_[i].content.maxWidth || this.defaultMaxWidth);
        width -= newSize - sizes[i];
        sizes[i] = newSize;
      }

      if ( width !== 0 ) {
        // either the last view needs to suck up extra space, or only one view fit and it needs to shrink
        i = this.visibleEnd_;
        sizes[i] += width;
      }

      var foundTop = false;
      var pos = this.el().offsetWidth;
      for (i = this.visibleEnd_; i >= 0; i--) {
        var size = sizes[i] || 0; // size zero for buried items to the left
        pos -= size; // left edge
        var obj = this.views_[i];
        // ugly code to not animate width on the topmost visible view
        if ( this.transition == 'slide' ) {
          if ( ! foundTop ) {
            obj.panel.style({ transition: "left 300ms ease" });
            foundTop = true;
          } else {
            obj.panel.style({ transition: "left 300ms ease, width 300ms ease" });
          }
        }
        if (size > 0) {
          // Only set size for non-zero, buried panels will be overlapped.
          obj.panel.style({ width: size + 'px' });
        }
        obj.panel.style({
          'z-index': i, // z ordering ensures overlap
          left: pos + 'px',
          top: '0px'
        });
      }
    },
    function initE(opt_x) {
      this.cls(this.myCls());
    },
    function load() {
      this.SUPER();
      this.onLoad();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        height: 100%;
        overflow-x: hidden;
        position: relative;
        width: 100%;
      }
      ^panel {
        background-color: #fff;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: absolute;
      }
      ^edge {
        background-color: #000;
        height: 100%;
        opacity: 0.1;
        position: absolute;
        right: 0px;
        top: 0px;
        width: 1px;
        z-index: 100;
      }

      ^hidden {
        display: none;
      }
      ^no-input {
        pointer-events: none;
      }
    */},
  ],

  listeners: [
    function onLoad() {
      // Render and configure each child view that has already been loaded.
      for (var i = 0; i < this.views_.length; i++) {
        this.renderChild(i);
      }
      this.resize();
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        this.resize();
      }
    },
    {
      name: 'pushView_',
      isFramed: true,
      documentation: function() {/*
        <p>The real implementation used to push new views onto the stack.
        The index specifies the level of the stack we're operating at.

        Generally this is not called directly. Instead, views use the stack in
        their contexts to push views. That method is a bound call to this function
        with the index set appropriately.

        <h4>Hints</h4>
        <p>The last argument is an object containing hints. Should the switch
        be transitionless, or backwards? The supported hints are documented here.
        They take the form of an object with options rather than a confusing
        series of optional arguments.</p>
        <dl>
          <dt>instant: true</dt>
          <dd>If this StackView is configured to use an animated transition,
          setting <tt>instant: true</tt> will skip the transition and instantly
          replace the view.</dd>

          <dt>preview: true</dt>
          <dd>Previews are optional pushes. This mode might be used to push and
          render details of the item under the cursor. Show the child view (the
          preview) if there's room for both the main and child views, but if
          there isn't room then keep showing the main view.</dd>
        </dl>
      */},
      // TODO(braden): Actually implement the preview hint. Instant is a no-op
      // until we actually have animated transitions to skip.
      code: function(index, view, hints) {
        if (!view) return;
        if (!hints) hints = {};

        // Pushing a new view with index i means we drop everything in the list
        // that's greater than i, and then add the new view back. There will be
        // i + 1 views in the stack after a pushView(i, v);
        this.destroyChildViews_(index + 1);

        var substack = {
          __proto__: this,
          pushView: this.pushView_.bind(this, this.views_.length),
          popView: this.popView_.bind(this, this.views_.length),
          popChildViews: this.popView_.bind(this, this.views_.length+1),
          replaceView: this.replaceView_.bind(this, this.views_.length),
        };

        // HACK: Replacing the values of properties on a child view is a hack
        // and dangerous. If we can think of a better way to make sure the child
        // view is talking to the right stack, then we should change this.
        if (view.stack)
          view.stack = substack;
        view.X.set('stack', substack);
        view.Y.set('stack', substack);

        this.views_.push({
          content: view
        });

        this.renderChild(index + 1);
        this.setTimeout(this.onResize, 100);
      }
    },
    {
      name: 'popView_',
      isFramed: true,
      code: function popView_(index) {
        // popView_(i) pops everything greater than and including i. Therefore,
        // a view that calls this.stack.popView() (on the substack object created
        // above) will be removed from the stack.
        if ( index >= this.views_.length ) return;

        this.visibleStart_ -= this.visibleEnd_ - index + 1;
        this.visibleEnd_ = index - 1;
        this.destroyChildViews_(index);
        this.setTimeout(this.onResize, 100);
      }
    },
    {
      name: 'replaceView_',
      isFramed: true,
      code: function(index, view, hints) {
        this.popView_(index);
        this.pushView_(index - 1, view, hints);
      }
    }
  ]
});
