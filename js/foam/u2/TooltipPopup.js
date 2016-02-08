/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'TooltipPopup',
  extends: 'foam.u2.Element',

  imports: [
    'document',
    'dynamic',
    'window',
  ],

  documentation: function() {/*
    <p>A generic container for pop-up tooltip content. Invisible; the look and
    feel are determined by the inner views you add.</p>
    <p>You need to provide a $$DOC{ref:".target"} element.</p>
    <p><strong>DOES NOT</strong> handle show/hide events - those are to be
    handled separately, eg. by $$DOC{ref:"foam.u2.Tooltip"} for actual help
    tooltips.</p>
    <p>However, it does handle smart mouseover - if the mouse is hovering over
    this tooltip, it won't disappear when $$DOC{ref:".close"} is called. Call
    $$DOC{ref:".forceClose"} if needed, or it will disappear when it has been
    ordered closed and the mouse is not over the tooltip.<p>
    <p>The idea is that you can naively open/close this popup with
    mouseenter/mouseleave events on some other element, and this popup will
    handle the tricky logic.</p>
    <p>Removes itself from the DOM once really closed.</p>
  */},

  properties: [
    {
      name: 'target',
      required: true,
      documentation: 'The tooltip will be positioned relative to this ' +
          'element. Alternatively, you can supply $$DOC{ref:".targetX"} and ' +
          '$$DOC{ref:".targetY"}.',
    },
    {
      type: 'Int',
      name: 'targetX',
      documentation: 'You can supply either $$DOC{ref:".target"}, or targetX ' +
          'and targetY.',
    },
    {
      type: 'Int',
      name: 'targetY',
      documentation: 'You can supply either $$DOC{ref:".target"}, or targetX ' +
          'and targetY.',
    },
    {
      type: 'Boolean',
      name: 'opened',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'hovered',
      defaultValue: false
    },
    {
      type: 'Int',
      name: 'mouseBuffer',
      documentation: 'The number of (CSS) pixels away from either element ' +
          'the cursor is allowed to get before the popup disappears.',
      defaultValue: 30,
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        position: fixed;
        visibility: hidden;
        z-index: 2000;
        -webkit-transform: translate3d(0, 0, 2px);
      }
    */},
  ],

  methods: [
    function initE() {
      this.cls(this.myCls());
      this.on('mouseenter', function() { this.hovered = true; }.bind(this));
      this.on('mouseleave', function() { this.hovered = false; }.bind(this));
      this.on('load', this.reposition);

      // Bind and unbind a global mousemove listener.
      this.on('load', function() {
        this.document.body.addEventListener('mousemove', this.onMouseMove);
      }.bind(this));
      this.on('unload', function() {
        this.document.body.removeEventListener('mousemove', this.onMouseMove);
      }.bind(this));
    },
    function maybeClose_() {
      if (!this.opened && !this.hovered) {
        this.forceClose();
      }
    },
    function forceClose() {
      this.remove();
    },
    // Call this when eg. the mouse moves away from your tooltip target.
    function close() {
      this.opened = false;
    },
    function open() {
      if (!this.target && !(typeof this.targetX === 'number' &&
          typeof this.targetY === 'number')){
        console.error('You must provide TooltipPopup with a target element, ' +
            'or targetX and targetY coordinates.');
        return;
      }

      this.opened = true;
      this.hovered = false;
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    },
  ],

  listeners: [
    function reposition() {
      // Find the target element's viewport-relative position and size, and
      // then position the tooltip relative to it.
      // But we cap these values such that the popup does not overflow the edges
      // of the screen.
      var style = { visibility: 'visible' };

      // Remember that setting style.right sets the distance from the right edge
      // of the element to the right edge of the screen, but
      // getBoundingClientRect().right is the distance from the left edge of the
      // screen to the right edge of the element (ie. right == left + width).
      var myRect = this.el().getBoundingClientRect();
      var x, y;
      if (this.target) {
        var targetRect = this.target.el().getBoundingClientRect();
        x = targetRect.right;
        y = targetRect.bottom;
      } else {
        x = this.targetX;
        y = this.targetY;
      }

      if (x + myRect.width > this.document.body.clientWidth)
        style.right = '0px';
      else
        style.left = x + 'px';

      if (y + myRect.height > this.document.body.clientHeight)
        style.bottom = '0px';
      else
        style.top = y + 'px';

      this.style(style);
    },
    function onMouseMove(e) {
      // If the cursor is over either the target or popup, we can skip the rest.
      if (this.opened || this.hovered) return;

      // Check both the target's and popup's rectangles.
      var rect = this.el().getBoundingClientRect();
      if (rect.left - this.mouseBuffer <= e.x &&
          e.x <= rect.right + this.mouseBuffer &&
          rect.top - this.mouseBuffer <= e.y &&
          e.y <= rect.bottom + this.mouseBuffer) {
        return;
      }

      this.maybeClose_();
    },
  ]
});
