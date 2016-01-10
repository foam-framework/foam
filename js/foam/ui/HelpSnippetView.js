/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui',
  name: 'HelpSnippetView',
  extends: 'foam.ui.SimpleView',

  properties: [
    'data',
    {
      type: 'foam.ui.BaseView',
      name: 'target',
      required: true,
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'location',
      defaultValue: 'ABOVE',
      choices: [
        ['ABOVE', 'Above'],
        ['BELOW', 'Below'],
        ['LEFT', 'Left'],
        ['RIGHT', 'Right'],
      ],
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'actionLocation',
      defaultValue: 'BOTTOM_RIGHT',
      choices: [
        ['TOP_LEFT', 'Top-left'],
        ['TOP_RIGHT', 'Top-right'],
        ['BOTTOM_LEFT', 'Bottom-left'],
        ['BOTTOM_RIGHT', 'Bottom-right'],
      ],
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.opacity = nu === null ? '' : nu;
      },
    },
    {
      type: 'Function',
      name: 'abeforeInit',
      defaultValue: anop,
    },
    {
      type: 'Function',
      name: 'aafterDestroy',
      defaultValue: anop,
    },
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      var rect = this.target.$.getBoundingClientRect();
      if ( this.location === 'ABOVE' ) {
        this.$.style.top = 'calc(' + rect.top + 'px - 2em - 5px - 2px - 4px)';
        this.$.style.width = rect.width - 2;
        this.$.style.left = rect.left + 1;
      } else if ( this.location === 'BELOW' ) {
        this.$.style.top = (rect.bottom + 4) + 'px';
        this.$.style.width = (rect.width - 2) + 'px';
        this.$.style.left = (rect.left + 1) + 'px';
      } else if ( this.location === 'LEFT' ) {
        this.$.style.left = 'calc(' + rect.left + 'px - 4em - 5px - 2px - 4px)';
        this.$.style.height = rect.height - 2;
        this.$.style.top = rect.top + 1;
      } else if ( this.location === 'RIGHT' ) {
        this.$.style.left = (rect.right + 4) + 'px';
        this.$.style.height = (rect.height - 2) + 'px';
        this.$.style.top = (rect.top + 1) + 'px';
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <help-snippet id="%%id" %%cssClassAttr()>
        <text-container>
          <text><span>{{this.data}}</span></text>
          <text-indicator>
            <text-indicator-first></text-indicator-first>
            <text-indicator-second></text-indicator-second>
          </text-indicator>
        </text-container>
      </help-snippet>
      <% this.setClass('above', function() {
           return this.location === 'ABOVE';
         }.bind(this), this.id);
         this.setClass('below', function() {
           return this.location === 'BELOW';
         }.bind(this), this.id);
         this.setClass('left', function() {
           return this.location === 'LEFT';
         }.bind(this), this.id);
         this.setClass('right', function() {
           return this.location === 'RIGHT';
         }.bind(this), this.id); %>
    */},
    function CSS() {/*
      help-snippet {
        align-items: flex-start;
        position: fixed;
        color: white;
        z-index: 1000;
        opacity: 0;
      }
      help-snippet,
      help-snippet text-container,
      help-snippet text-container text,
      help-snippet text-container text-indicator {
        display: flex;
      }
      help-snippet text-container {
        flex-grow: 0;
        flex-shrink: 0;
      }
      help-snippet text-container text {
        flex-direction: column;
      }
      help-snippet text-container text-indicator text-indicator-first,
      help-snippet text-container text-indicator text-indicator-second {
        flex-grow: 1;
      }
      help-snippet.above,
      help-snippet.below,
      help-snippet.above text-container {
        flex-direction: column;
      }
      help-snippet.above text-container text,
      help-snippet.below text-container text {
        height: 2em;
      }
      help-snippet.above {
        border-bottom: 2px solid white;
      }
      help-snippet.above text-container text-indicator,
      help-snippet.below text-container text-indicator {
        flex-direction: row;
      }
      help-snippet.above text-container text-indicator text-indicator-first,
      help-snippet.above text-container text-indicator text-indicator-second,
      help-snippet.below text-container text-indicator text-indicator-first,
      help-snippet.below text-container text-indicator text-indicator-second {
        height: 5px;
      }
      help-snippet.above text-container text-indicator text-indicator-first,
      help-snippet.below text-container text-indicator text-indicator-first {
        border-right: 1px solid white;
      }
      help-snippet.above text-container text-indicator text-indicator-second,
      help-snippet.below text-container text-indicator text-indicator-second {
        border-left: 1px solid white;
      }
      help-snippet.below {
        border-top: 2px solid white;
      }
      help-snippet.below text-container {
        flex-direction: column-reverse;
      }
      help-snippet.left,
      help-snippet.right,
      help-snippet.left text-container {
        flex-direction: row;
      }
      help-snippet.left text-container text,
      help-snippet.right text-container text {
        width: 4em;
      }
      help-snippet.left {
        border-right: 2px solid white;
      }
      help-snippet.left text-container text-indicator,
      help-snippet.right text-container text-indicator {
        flex-direction: column;
      }
      help-snippet.left text-container text-indicator text-indicator-first,
      help-snippet.left text-container text-indicator text-indicator-second,
      help-snippet.right text-container text-indicator text-indicator-first,
      help-snippet.right text-container text-indicator text-indicator-second {
        width: 5px;
      }
      help-snippet.left text-container text-indicator text-indicator-first,
      help-snippet.right text-container text-indicator text-indicator-first {
        border-bottom: 1px solid white;
      }
      help-snippet.left text-container text-indicator text-indicator-second,
      help-snippet.right text-container text-indicator text-indicator-second {
        border-top: 1px solid white;
      }
      help-snippet.right {
        border-left: 2px solid white;
      }
      help-snippet.right text-container {
        flex-direction: row-reverse;
      }
      help-snippet.left text-container text span {
        margin: 0 3px 0 0;
      }
      help-snippet.right text-container text span {
        margin: 0 0 0 3px;
      }
    */}
  ]
});
