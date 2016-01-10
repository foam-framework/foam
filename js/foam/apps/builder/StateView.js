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
  package: 'foam.apps.builder',
  name: 'StateView',
  extends: 'foam.ui.SimpleView',

  constants: {
    STATES: {
      AUTHENTICATING: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAByElEQVR42u3WTytEURiA8WuB8Q3QsFKThcZ8BSnFTjZ8AwtfgC0b7NDMwkbJgrJkJymJFKthZmyUvfGf4r6exVnc3sXpxrmcxTn120xvp/vczsyZKKywwgorrLBcrqGF5xIqqOPDqKGMIiKXXG7WgXWIRWzicr4FdOAIktIhcj4FrEOUT1SNT4hS9iWgBFE20JmY6cIm9HEq+hBQ0Q9vmd1Ss2s+BNTVsem0zOYRQ4wrHwI+IEY1xXwDYryHAAcBNXWEuiyzPYiTwT4ElCEJm5bZbTW74kNAETEkYQt59eb1w8cY8OUiq0CUGA0jhiirPt3EORxCUjpAuw8BOqKi3rYWYzXx8F4EaEWs4QrvRhUr6sz7GmAXAjIK6MUUlrGPazTxZTTNZ3tYwiR6/jughCXUIT9UwyIG/yqgBRM4gzh2inG0ZBXQjxNICs9o4MK4wQskhWMUXAeM4Mny236KeYyi27JPN8awgDPLnfGIYVcB/XiFKLeYRf6XX/453EGUFxRcBOyqje8xjVZEjrRhBg+QhB0XAU2I8YA+RBkpqKN67yJAEs4RZewSYkgIUJu94jJjb84D/loI8Ckg/J0OASEgBISAEGDzDROMbil7VTXFAAAAAElFTkSuQmCC',
        label: 'Authenticating',
      },
      UPLOADING: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABRSURBVHja7ctBCgAhEANBM/9/tCBI72lD8CIyOYau0TuYFPZVCvtIqNYU9gjfI6Ie4XtE1iN8j8h6hO8RpveCPhHsW+6vQQMDnlv97EbQu2wTB4oDiVheWpoAAAAASUVORK5CYII=',
        label: 'Uploading',
      },
      PUBLISHING: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABQSURBVHja7dMxCgAgEANBc/9/tGCzIGJId8Wl3imzZt1Wn3UEDSaFfZXCPhKqM4U9wveIqEf4HpH1CN8jsh7he4TpvaBPBHsdZ8CAG8yabgOmygOJ6/d7FAAAAABJRU5ErkJggg==',
        label: 'Publishing',
      },
      DOWNLOADING: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABRSURBVHja7dQxCgAgEANB4/8fbSOsIBJiJXipd7juWu1ufVmBAjdA/TiFQskNei/orfA9IuwR9FaEPYLeC/pI0Hsx+0ioRZN++9r7XgS1xzYA40YDiYfzhyQAAAAASUVORK5CYII=',
        label: 'Downloading',
      },
      IMPORTING: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABRSURBVHja7dQxCgAgEANB4/8fbSOsIBJiJXipd7juWu1ufVmBAjdA/TiFQskNei/orfA9IuwR9FaEPYLeC/pI0Hsx+0ioRZN++9r7XgS1xzYA40YDiYfzhyQAAAAASUVORK5CYII=',
        label: 'Importing',
      },
      COMPLETED: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAANlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfSUxYFuAAAAEXRSTlMAPHnzgDvyD7k3yPAH8To4OXkywHcAAABoSURBVHja7c45DoBADEPRAGGZYfX9L0uHhBsrAomCuH5fsuVyj9a0Qd/Bgx7wkKfgW9//zQ+v+nEqMV8xl4BfKoC1BP47bsV2eVHs7HVBXhcHe12Ql8VAXhfkRcFeF+x1wV4Xbrmc2QlepwrslsnTgQAAAABJRU5ErkJggg==',
        label: 'Completed',
      },
      FAILED: {
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABqUlEQVR42u3ZPU4CQRiA4eWvwA4JhYKewh9sPQMJJHoP1B4CLUYxeAQiBYnxHoQLSKBxgcqC3WZ8CwrLWT529wvZSZ52s28yO5nZcZKRjGTIx23rN40qnjDCFCv4WytM8YFHXCMNR0r6gHN0sYAJaI4OKnEElDCADyPk4Q3FqALusIbZsyUaYQbk8A4Tsjdk9x1whC+YiHwiv6+AnODlpRFZcYBo2sj1pQH3MDGr7xpQwlpBgIvjXQIGMAIO/jMCL0EDzuArCtigHCSgC6MmAGjbBqSxUBgwQ8om4AZGXQBwZRPwpDjgwSZgpDhgaBMwVRwwsQlYKQ5wbQJ8xQHeIQQc/hSawig1ESyjMlEuo4+KA5o2AVXFAZe2m7m5wo/4224zB3QUBrSCnAcq8JQdaE7sA4C+ooDeLmfiIpYwMftBIXgA0FAQUJP+2OrDxOQZjjQgi0+YiI2RkQcA+YgjxkF+7trK4jWiaZMJ84KjDjek1aYW1RXTMV7gwQht0EMhjku+MtqY7bi3aeFUfsknl8YlHjDEBC68LRcTDNHEBVIKrlllkoAkQIE/hbbMsIpv+8sAAAAASUVORK5CYII=',
        label: 'Failed',
      },
    },
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) { this.onDataStateChange(); },
    },
    {
      type: 'String',
      name: 'className',
      defaultValue: 'md-subhead',
    },
    {
      type: 'String',
      name: 'stateLabelClassName',
      defaultValue: 'md-grey',
    },
    {
      name: '$icon',
      defaultValueFn: function() { return this.$ && this.$.querySelector('img'); }
    },
    {
      name: '$label',
      defaultValueFn: function() { return this.$ && this.$.querySelector('state-label'); }
    },
  ],

  listeners: [
    {
      name: 'onDataStateChange',
      code: function() {
        if ( ! this.$ ) return;
        var state = this.STATES[this.data];
        if ( ! state ) return;
        this.$icon.src = state.icon;
        this.$label.textContent = state.label;
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <flow-state id="%%id" %%cssClassAttr()><% this.toInnerHTML(out); %></flow-state>
    */},
    function toInnerHTML() {/*
      <% var state = this.STATES[this.data];
         if ( state ) { %>
           <img id="%%id-icon" src="{{state.icon}}">
           <state-label class="{{this.stateLabelClassName}}">{{state.label}}</state-label>
      <% }
         this.setClass('processing', function() {
           return this.data !== 'FAILED' && this.data !== 'COMPLETED';
         }.bind(this), this.id + '-icon'); %>
    */},
    function CSS() {/*
      @keyframes pulseopacity {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0.3;
        }
      }
      flow-state {
        display: flex;
      }
      flow-state {
        align-items: center;
        justify-content: center;
      }
      flow-state img {
        flex-grow: 0;
        flex-shrink: 0;
      }
      flow-state img.processing {
        animation-name: pulseopacity;
        animation-duration: 0.8s;
        animation-timing-function: cubic-bezier(0,.3,.8,1);
        animation-delay: 0;
        animation-direction: alternate;
        animation-iteration-count: infinite;
        animation-fill-mode: none;
        animation-play-state: running;
      }
      flow-state img, flow-state state-label {
        margin: 0;
      }
      flow-state state-label {
        margin-left: 12px;
      }
    */},
  ],
});
