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
  name: 'ExportFlowView',
  extendsModel: 'foam.ui.SimpleView',

  imports: [
    'popup',
    'window',
  ],

  constants: {
    STATE_ICONS: {
      AUTHENTICATING: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAByElEQVR42u3WTytEURiA8WuB8Q3QsFKThcZ8BSnFTjZ8AwtfgC0b7NDMwkbJgrJkJymJFKthZmyUvfGf4r6exVnc3sXpxrmcxTn120xvp/vczsyZKKywwgorrLBcrqGF5xIqqOPDqKGMIiKXXG7WgXWIRWzicr4FdOAIktIhcj4FrEOUT1SNT4hS9iWgBFE20JmY6cIm9HEq+hBQ0Q9vmd1Ss2s+BNTVsem0zOYRQ4wrHwI+IEY1xXwDYryHAAcBNXWEuiyzPYiTwT4ElCEJm5bZbTW74kNAETEkYQt59eb1w8cY8OUiq0CUGA0jhiirPt3EORxCUjpAuw8BOqKi3rYWYzXx8F4EaEWs4QrvRhUr6sz7GmAXAjIK6MUUlrGPazTxZTTNZ3tYwiR6/jughCXUIT9UwyIG/yqgBRM4gzh2inG0ZBXQjxNICs9o4MK4wQskhWMUXAeM4Mny236KeYyi27JPN8awgDPLnfGIYVcB/XiFKLeYRf6XX/453EGUFxRcBOyqje8xjVZEjrRhBg+QhB0XAU2I8YA+RBkpqKN67yJAEs4RZewSYkgIUJu94jJjb84D/loI8Ckg/J0OASEgBISAEGDzDROMbil7VTXFAAAAAElFTkSuQmCC',
      UPLOADING: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABRSURBVHja7ctBCgAhEANBM/9/tCBI72lD8CIyOYau0TuYFPZVCvtIqNYU9gjfI6Ie4XtE1iN8j8h6hO8RpveCPhHsW+6vQQMDnlv97EbQu2wTB4oDiVheWpoAAAAASUVORK5CYII=',
      PUBLISHING: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABQSURBVHja7dMxCgAgEANBc/9/tGCzIGJId8Wl3imzZt1Wn3UEDSaFfZXCPhKqM4U9wveIqEf4HpH1CN8jsh7he4TpvaBPBHsdZ8CAG8yabgOmygOJ6/d7FAAAAABJRU5ErkJggg==',
      DOWNLOADING: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAABRSURBVHja7dQxCgAgEANB4/8fbSOsIBJiJXipd7juWu1ufVmBAjdA/TiFQskNei/orfA9IuwR9FaEPYLeC/pI0Hsx+0ioRZN++9r7XgS1xzYA40YDiYfzhyQAAAAASUVORK5CYII=',
      COMPLETED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAANlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfSUxYFuAAAAEXRSTlMAPHnzgDvyD7k3yPAH8To4OXkywHcAAABoSURBVHja7c45DoBADEPRAGGZYfX9L0uHhBsrAomCuH5fsuVyj9a0Qd/Bgx7wkKfgW9//zQ+v+nEqMV8xl4BfKoC1BP47bsV2eVHs7HVBXhcHe12Ql8VAXhfkRcFeF+x1wV4Xbrmc2QlepwrslsnTgQAAAABJRU5ErkJggg==',
      FAILED: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABqUlEQVR42u3ZPU4CQRiA4eWvwA4JhYKewh9sPQMJJHoP1B4CLUYxeAQiBYnxHoQLSKBxgcqC3WZ8CwrLWT529wvZSZ52s28yO5nZcZKRjGTIx23rN40qnjDCFCv4WytM8YFHXCMNR0r6gHN0sYAJaI4OKnEElDCADyPk4Q3FqALusIbZsyUaYQbk8A4Tsjdk9x1whC+YiHwiv6+AnODlpRFZcYBo2sj1pQH3MDGr7xpQwlpBgIvjXQIGMAIO/jMCL0EDzuArCtigHCSgC6MmAGjbBqSxUBgwQ8om4AZGXQBwZRPwpDjgwSZgpDhgaBMwVRwwsQlYKQ5wbQJ8xQHeIQQc/hSawig1ESyjMlEuo4+KA5o2AVXFAZe2m7m5wo/4224zB3QUBrSCnAcq8JQdaE7sA4C+ooDeLmfiIpYwMftBIXgA0FAQUJP+2OrDxOQZjjQgi0+YiI2RkQcA+YgjxkF+7trK4jWiaZMJ84KjDjek1aYW1RXTMV7gwQht0EMhjku+MtqY7bi3aeFUfsknl8YlHjDEBC68LRcTDNHEBVIKrlllkoAkQIE/hbbMsIpv+8sAAAAASUVORK5CYII=',
    },
  },

  properties: [
    {
      type: 'foam.apps.builder.ExportFlow',
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.state$.removeListener(this.onStateChange);
        if ( nu ) nu.state$.addListener(this.onStateChange);
      },
    },
    {
      name: '$icon',
      defaultValueFn: function() { return this.$ && this.$.querySelector('img'); }
    },
    {
      name: '$label',
      defaultValueFn: function() { return this.$ && this.$.querySelector('state-label'); }
    },
    {
      name: '$message',
      defaultValueFn: function() { return this.$ && this.$.querySelector('#' + this.id + '-message'); }
    },
    {
      name: '$details',
      defaultValueFn: function() { return this.$ && this.$.querySelector('details'); }
    },
  ],

  methods: [
    function stateLabel() {
      var state = this.data.state;
      var choices = this.data.model_.STATE.choices;
      var choice = choices.filter(function(c) { return c[0] === state; })[0];
      return (choice && choice[1]) || '';
    },
  ],

  actions: [
    {
      name: 'openDevDashboard',
      label: 'Open Developer Dashboard',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAMElEQVRIx2NgGAWkAKfWL//xYVLVjVowagEJGqmdTEdwPhhyQTma0UYtGMB8MLIAACgDuh9v+XUsAAAAAElFTkSuQmCC',
      ligature: 'dashboard',
      isAvailable: function() {
        return this.data &&
            (this.data.state === 'FAILED' || this.data.state === 'COMPLETED');
      },
      code: function() {
        this.window.open('https://chrome.google.com/webstore/developer/dashboard');
        this.popup.close();
      },
    },
    {
      name: 'close',
      label: 'Return to App Builder',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAKlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfQ4qnXoAAAADXRSTlMALb0VFr4r09XS1Cwq3rqZUAAAAFpJREFUeNrFkEEKwDAIBG3Upk3r/79bD4sseOgxe5wBGZT9O4YKZn6S8JgKfsUgoTMN+K3CZsXSzmGsOM/SdI7zxf8FetDWuKK6cVQ3XtUkPHlVO4mHn/jK9n3dyANYyKnIcwAAAABJRU5ErkJggg==',
      ligature: 'close',
      isAvailable: function() {
        return this.data &&
            (this.data.state === 'FAILED' || this.data.state === 'COMPLETED');
      },
      code: function() { this.popup.close(); },
    },
  ],

  listeners: [
    {
      name: 'onStateChange',
      code: function() {
        if ( ! this.$ ) return;
        this.$icon.src = this.STATE_ICONS[this.data.state];
        this.$label.textContent = this.stateLabel();
        this.$message.textContent = this.data.message;
        this.$details.textContent = this.data.details;
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <export-flow id="%%id">
        <p class="md-headline">{{this.data.title}}</p>
        <flow-state class="md-subhead">
          <img id="%%id-icon" src="{{this.STATE_ICONS[this.data.state]}}">
          <state-label class="md-grey">{{this.stateLabel()}}</state-label>
        </flow-state>
        <p id="%%id-message" class="md-subhead md-grey">{{this.data.message}}</p>
        <details class="md-subhead md-grey">{{this.data.details}}</details>
        <actions class="md-actions md-popup-footer-actions vertical">
          $$openDevDashboard{
            model_: 'foam.ui.md.FlatButton',
            displayMode: 'LABEL_ONLY',
          }
          $$close{
            model_: 'foam.ui.md.FlatButton',
            displayMode: 'LABEL_ONLY',
          }
        </actions>
      </export-flow>
      <% this.setClass('processing', function() {
           return this.data && this.data.state !== 'FAILED' &&
               this.data.state !== 'COMPLETED';
         }.bind(this), this.id + '-icon');
         this.setClass('hidden', function() {
           return ( ! this.data ) || ( ! this.data.message );
         }.bind(this), this.id + '-message'); %>
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
      export-flow {
        width: 600px;
      }
      export-flow, export-flow flow-state, export-flow actions {
        display: flex;
      }
      export-flow {
        flex-direction: column;
      }
      export-flow flow-state {
        align-items: center;
        justify-content: center;
      }
      export-flow flow-state img {
        flex-grow: 0;
        flex-shrink: 0;
      }
      export-flow flow-state img.processing {
        animation-name: pulseopacity;
        animation-duration: 0.8s;
        animation-timing-function: cubic-bezier(0,.3,.8,1);
        animation-delay: 0;
        animation-direction: alternate;
        animation-iteration-count: infinite;
        animation-fill-mode: none;
        animation-play-state: running;
      }
      export-flow flow-state img, export-flow flow-state state-label {
        margin: 0;
      }
      export-flow flow-state state-label {
        margin-left: 12px;
      }
      export-flow .hidden { display: none; }
    */},
  ],
});
