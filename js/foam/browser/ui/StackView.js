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
  package: 'foam.browser.ui',
  name: 'StackView',
  extends: 'foam.ui.SimpleView',
  imports: [
    'setTimeout',
    'window'
  ],
  exports: [
    'as stack'
  ],
  properties: [
    {
      type: 'Int',
      name: 'maxVisibleViews',
      defaultValue: 2,
      documentation: 'Limits the number of views on screen at a time.',
    },
    {
      name: 'views_',
      documentation: 'Internal array of child views.',
      factory: function() { return []; }
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
      name: 'className',
      defaultValue: 'stackview-container'
    },
    {
      type: 'Boolean',
      name: 'noDecoration',
      documentation: 'If true, panel edges are not added',
      defaultValue: false,
    },
    {
      name: 'transition',
      documentation: 'The transition when adding or removing a view. Choose from "slide" or "fade"',
      defaultValue: 'slide',
    },
  ],

  methods: [
    function init(args) {
      this.SUPER(args);
      this.window.addEventListener('resize', this.onResize);
    },
    {
      name: 'pushView',
      documentation: 'Default pushView that works on the top level. See ' +
          'pushView_ for details.',
      code: function(view, hints) {
        this.pushView_(-1, view, hints);
      }
    },
    {
      name: 'popView',
      documentation: 'Default popView that works on the top level. See ' +
          'popView_ for details.',
      code: function() {
        this.popView_(0);
      }
    },
    {
      name: 'popChildViews',
      documentation: 'Default popChildViews that works on the top level. See ' +
          'popView_ for details.',
      code: function() {
        this.popView_(1);
      }
    },
    function elementAnimationAdd_(style) {
      if ( this.transition == 'slide' ) {
        style.width = "0px";
        style.left = this.$.offsetWidth;
        // not animating width makes a big difference in performance by avoiding layout events
        style.transition = "left 300ms ease"; // "width 300ms ease, left 300ms ease";
      } else if ( this.transition == 'fade' ) {
        style.opacity = 0;
        style.transition = "opacity 300ms ease";
        this.X.setTimeout(function() { style.opacity = 1; }, 50);
      }
    },
    function elementAnimationRemove_(style) {
      if ( this.transition == 'slide' ) {
        style.left = this.$.offsetWidth;
      } else if ( this.transition == 'fade' ) {
        style.opacity = 0;
      }
    },
    function destroyChildViews_(index) {
      while(this.views_.length > index) {
        var obj = this.views_.pop();
        var e = this.X.$(obj.id);
        e && this.elementAnimationRemove_(e.style);
        this.resize();
        this.finishDestroy(obj);
      }
    },
    function finishDestroy(obj) {
      // separate method to capture proper obj in closure
      this.X.setTimeout(function() { // clean up after animation
        obj.view.destroy();
        // Destroy the Events.dynamic for the hidden class.
        obj.hideBinding && obj.hideBinding();
        var e = this.X.$(obj.id);
        if ( e ) e.outerHTML = '';
      }.bind(this), 1000);
    },

    function renderChild(index) {
      var obj = this.views_[index];
      this.$.insertAdjacentHTML('beforeend', this.childHTML(index, this.views_[index]));
      this.elementAnimationAdd_(this.X.$(obj.id).style);
      obj.view.setClass('stackview-hidden', function() { return this.noDecoration; }.bind(this), obj.id + '-edge');

      obj.view.initHTML();
    },
    function childHTML(index) {
      var obj = this.views_[index];
      var html = '<div id="' + obj.id + '" class="stackview-panel stackview-hidden stackview-no-input">';
      html += obj.view.toHTML();
      html += '  <div id="' + obj.id + '-edge" class="stackview-edge"></div>';
      html += '</div>';

      // This is added as an initializer, and when the inner view is inited,
      // the dynamic binding is created. We can't create it directly, or it
      // will throw unsubscribe immediately, since the DOM node is not yet
      // rendered.
      var self = this;
      obj.view.addInitializer(function() {
        obj.hideBinding = self.X.dynamicFn(
            function() { self.visibleStart_; self.visibleEnd_; },
            function() {
              var e = self.X.$(obj.id);
              if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
              // +1/-1 here to avoid hiding the panels animating out to the right
              // or being overlapped to the left
              DOM.setClass(e, 'stackview-hidden',
                  index < self.visibleStart_-1 || index > self.visibleEnd_+1);
              DOM.setClass(e, 'stackview-no-input',
                  index < self.visibleStart_ || index > self.visibleEnd_);
            }
        ).destroy;
      });

      return html;
    },
    function resize() {
      if ( ! this.$ ) return;
      var width = this.$.offsetWidth;
      var index = this.views_.length - 1;
      while (index >= 0 && width >= this.views_[index].view.minWidth) {
        width -= this.views_[index].view.minWidth;
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

      width = this.$.offsetWidth;
      var sizes = [];
      for (var i = this.visibleStart_; i <= this.visibleEnd_; i++) {
        var min = this.views_[i].view.minWidth;
        sizes[i] = min; // This leaves blanks for hidden views. Oh well.
        width -= min;
      }

      for (i = this.visibleEnd_; width > 0 && i >= this.visibleStart_; i--) {
        var newSize = Math.min(sizes[i] + width, this.views_[i].view.preferredWidth);
        width -= newSize - sizes[i];
        sizes[i] = newSize;
      }

      for (i = this.visibleEnd_; width > 0 && i >= this.visibleStart_; i--) {
        var newSize = Math.min(sizes[i] + width, this.views_[i].view.maxWidth);
        width -= newSize - sizes[i];
        sizes[i] = newSize;
      }

      if ( width !== 0 ) {
        // either the last view needs to suck up extra space, or only one view fit and it needs to shrink
        i = this.visibleEnd_;
        sizes[i] += width;
      }

      var foundTop = false;
      var pos = this.$.offsetWidth;
      for (i = this.visibleEnd_; i >= 0; i--) {
        var size = sizes[i] || 0; // size zero for buried items to the left
        pos -= size; // left edge
        var s = this.X.$(this.views_[i].id).style;
        // ugly code to not animate width on the topmost visible view
        if ( this.transition == 'slide' ) {
          if ( ! foundTop ) {
            s.transition = "left 300ms ease";
            foundTop = true;
          } else {
            s.transition = "left 300ms ease, width 300ms ease";
          }
        }
        if (size > 0) {
          s.width = size + 'px'; // only set size for non-zero, buried panels will be overlapped
        }
        s.zIndex = i; // z ordering ensures overlap
        s.left = pos + 'px';
        s.top = "0px";
      }
    },
  ],

  templates: [
    function CSS() {/*
      .stackview-container {
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        position: relative;
      }
      .stackview-panel {
        background-color: #fff;
        height: 100%;
        position: absolute;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .stackview-edge {
        background-color: #000;
        height: 100%;
        position: absolute;
        right: 0px;
        top: 0px;
        opacity: 0.1;
        width: 1px;
        z-index: 100;
      }

      .stackview-hidden {
        display: none;
      }

      .stackview-no-input {
        pointer-events: none;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>></div>
      <% this.addInitializer(this.onLoad); %>
    */},
  ],

  listeners: [
    {
      name: 'onLoad',
      code: function() {
        // Render and configure each child view that has already been loaded.
        for (var i = 0; i < this.views_.length; i++) {
          this.renderChild(i);
        }
        this.resize();
      }
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
          replaceView: this.replaceView_.bind(this, this.views_.length)
        };

        // HACK: Replacing the values of properties on a child view is a hack
        // and dangerous. If we can think of a better way to make sure the child
        // view is talking to the right stack, then we should change this.
        if (view.stack)
          view.stack = substack;
        view.X.stack = substack;
        view.Y.stack = substack;

        this.views_.push({
          id: this.nextID(),
          view: view
        });

        if (this.$) this.renderChild(index + 1);
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
