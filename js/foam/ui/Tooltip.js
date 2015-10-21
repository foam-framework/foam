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
  package: 'foam.ui',
  name: 'Tooltip',

  extends: 'foam.ui.View',

  documentation: function() {/*
    Tooltips are designed to float above the document and clean themselves up.</p>
    <p>See
    <a href="http://www.google.com/design/spec/components/tooltips.html#tooltips-usage">http://www.google.com/design/spec/components/tooltips.html#tooltips-usage</a>
    for tooltip guidelines.
  */},

  properties: [
    {
      name: 'text',
      help: 'Help text to be shown in tooltip.'
    },
    {
      name: 'target',
      help: 'Target element to provide tooltip for.'
    },
    {
      name: 'className',
      defaultValue: 'tooltip'
    },
    {
      name: 'closed',
      defaultValue: false
    }
  ],

  templates: [
    function CSS() {/*
      .tooltip {
        background: rgba(80,80,80,0.9);
        border-radius: 4px;
        color: white;
        font-size: 10pt;
        left: 0;
        padding: 5px 8px;
        position: absolute;
        top: 0;
        z-index: 2000;
        -webkit-transform: translate3d(0, 0, 2px);
      }
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      var document = this.X.document;
      document.previousTooltip_ = this;

      this.X.setTimeout(function() {
        if (document.previousTooltip_ !== this) return;
        var oldTips = document.getElementsByClassName('tooltip');
        for (var i = 0; i < oldTips.length; i++) {
          oldTips[i].remove();
        }
        var div = document.createElement('div');

        // Close immediately on mousedown/touchstart.
        this.target.addEventListener('mousedown', this.close.bind(this));
        this.target.addEventListener('touchstart', this.close.bind(this));

        div.className = this.className;
        div.id = this.id;
        div.innerHTML = this.toInnerHTML();

        document.body.appendChild(div);

        var s            = this.X.window.getComputedStyle(div);
        var pos          = findViewportXY(this.target);
        var screenHeight = this.X.document.body.clientHeight;
        var scrollY      = this.X.window.scrollY;
        var above        = pos[1] - scrollY > screenHeight / 2;
        var left         = pos[0] + ( this.target.clientWidth - toNum(s.width) ) / 2;
        var maxLeft      = this.X.document.body.clientWidth + this.X.window.scrollX - 15 - div.clientWidth;
        var targetHeight = this.target.clientHeight || this.target.offsetHeight;

        div.style.top = above ?
            pos[1] - targetHeight - 8 :
            pos[1] + targetHeight + 8 ;
        div.style.left = Math.max(this.X.window.scrollX + 15, Math.min(maxLeft, left));

        this.initHTML();
      }.bind(this), 400);
    },
    toInnerHTML: function() { return this.text; },
    close: function() {
      if ( this.$ ) {
        this.$.remove();
      }
    },
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      this.close();
    }
  }
});
