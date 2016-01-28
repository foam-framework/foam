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
  package: 'foam.u2.md',
  name: 'Tooltip',
  extends: 'foam.u2.Element',

  imports: [
    'document',
    'setTimeout',
    'window',
  ],

  documentation: function() {/*
    Tooltips are designed to float above the document and clean themselves up.</p>
    <p>See
    <a href="http://www.google.com/design/spec/components/tooltips.html#tooltips-usage">http://www.google.com/design/spec/components/tooltips.html#tooltips-usage</a>
    for tooltip guidelines.</p>
    <p>The idea is that you can create this popup on mouseenter, and it will
    delay the specified 400ms before appearing with the MD animation. The
    tooltip should clean itself up, when the user clicks or moves away.</p>
  */},

  properties: [
    {
      name: 'text',
      documentation: 'Help text to show in the tooltip.',
    },
    {
      name: 'target',
      documentation: 'The tooltip will be positioned relative to this element.',
      required: true,
    },
    {
      type: 'Boolean',
      name: 'opened',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'closed',
      defaultValue: false
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.document.previousTooltip_ = this;
      this.setTimeout(this.onTimeout, 400);
    },
  ],

  listeners: [
    function close() {
      this.closed = true;
      if ( this.opened ) {
        this.remove();
        this.opened = false;
      }
    },
    function onTimeout() {
      if ( this.document.previousTooltip_ !== this ) return;
      if ( this.closed ) return;
      if ( ! this.target || ! this.target.el() ) return;

      var oldTips = this.document.getElementsByClassName(this.myCls());
      for (var i = 0; i < oldTips.length; i++) {
        oldTips[i].remove();
      }

      this.target.on('mousedown', this.close);
      this.target.on('touchstart', this.close);
      this.target.on('unload', this.close);
      this.on('unload', function() {
        this.opened = false;
        this.closed = true;
      });

      this.cls(this.myCls());
      this.add(this.text);
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);

      var targetE = this.target.el();
      var s = this.window.getComputedStyle(this.el());
      var pos = findViewportXY(targetE);
      var screenHeight = this.document.body.clientHeight;
      var scrollY = this.window.scrollY;
      var above = pos[1] - scrollY > screenHeight / 2;
      var left = pos[0] + ( targetE.clientWidth - toNum(s.width) ) / 2;
      var maxLeft = this.document.body.clientWidth + this.window.scrollX - 15 - this.el().clientWidth;
      var targetHeight = targetE.clientHeight || targetE.offsetHeight;

      this.opened = true;
      this.load();
      this.style({
        visibility: 'visible',
        top: (above ?
            pos[1] - targetHeight - 8 :
            pos[1] + targetHeight + 8) + 'px',
        left: Math.max(this.window.scrollX + 15, Math.min(maxLeft, left)) + 'px'
      });
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        background: rgba(80, 80, 80, 0.9);
        border-radius: 4px;
        color: white;
        font-size: 10pt;
        left: 0;
        padding: 5px 8px;
        position: absolute;
        top: 0;
        transform: translate3d(0, 0, 2px);
        z-index: 2000;
      }
    */},
  ]
});
