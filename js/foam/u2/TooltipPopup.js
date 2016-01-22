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
      documentation: 'The tooltip will be positioned relative to this element.',
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
  ],

  templates: [
    function CSS() {/*
      ^ {
        display: none;
        position: fixed;
        z-index: 2000;
        -webkit-transform: translate3d(0, 0, 2px);
      }
    */},
  ],

  methods: [
    function initE() {
      this.cls(this.myCls());
      this.on('mouseenter', function() { this.hovered = true; }.bind(this));
      this.on('mouseleave', function() {
        this.hovered = false;
        this.maybeClose_();
      }.bind(this));
      this.on('load', this.reposition);
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
      this.maybeClose_();
    },
    function open() {
      this.opened = true;
      this.hovered = false;
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    }
  ],

  listeners: [
    function reposition() {
      // Find the target element's viewport-relative position and size, and
      // then position the tooltip relative to it.
      var rect = this.target.el().getBoundingClientRect();
      this.style({
        display: 'block',
        top: (rect.top + rect.height) + 'px',
        left: (rect.left + rect.width) + 'px',
      });
    },
  ]
});
