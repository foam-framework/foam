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
  package: 'foam.demos',
  name: 'ExpandingCard',
  extends: 'foam.ui.DetailView',
  documentation: 'Demo/test of card which expands. Used in Flow.js demo.',

  requires: [
    'foam.ui.md.FlatButton'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'expanded'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.expanded$.addListener(function() {
        this.destroy();
        this.$.outerHTML = this.toHTML();
        this.initHTML();
        this.resize();
      }.bind(this));
    }
  },

  templates: [
    function CSS() {/*
      .expanding-card .icon {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAABICAYAAAC9bQZsAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAddJREFUaIHt2z9Lw0AcxvHnLrFSCUJBswhdOvgKxMU/tdjdqb6DvihfgTq5F2KtLtI3oIOLoEMqFG1o6J/0HGKrGEWKRfuE32cq4aD5kktuuVP6uGPwScm1UMnb2Fm1sJZVcBbU5yH/KhgYPIQGjVaE0/shPD9KjFEfwwqOwtHGIoqu/ac3+lt1f4hqs4e74P0Z6fGPrRWN6/ISXRQAFF0b1+UlbK1McuKwgqNwtp1FLjNfU24auUzcUHDiBg0ARxuL1FFjuUz8KgGALrkW5fT7TtG1UXIt6Eo+PVFjlbwNdfMcmfVl/fNoIrcvI6hOf2TmbZ36rWBgoIwxyQXaC3HRSi5682h31YJXyiaup2sOfiBhbCSMjYSxkTA2EsZGwthIGBsJYyNhbCSMjYSxkTA2EsZGwthIGBsJYyNhbCSMjYSxkTA2EsZGwthIGJsv9yumQWqfmISxkTA2djAwMz9GZZ0EU42PDp2Z/n9nYKAfwvR97R9DA90g2V8/jUYrgtr3uqa2l9yQz6x8HkJ7foS6P/zve5mZuh8fbdQAUG320O7zv2vtvkG12QPw9rm/CwwOLkPquHY/bhif05ysY1dPI2zWupTTsu4PsVnr4uppNLmm0npc+BWKXKHlR+KKRQAAAABJRU5ErkJggg==);
        background-repeat: no-repeat;
        display: inline-block;
        height: 72px;
        width: 54px;
      }
      .expanding-card .closed {
        display: flex;
      }
      .expanding-card .closed .icon {
        border: 28px solid #02A8F3;
      }
      .expanding-card .closed flat-button {
        color: black !important;
        font-size: 26px;
        flex-grow: 1;
        justify-content: flex-start;
        text-transform: none;
      }
      .expanding-card .open .icon {
        margin-left: 8px;
      }
      .expanding-card .open flat-button {
        margin-left: -15px;
        margin-top: 10px;
        padding-right: 150px;
      }
      .expanding-card .header {
        font-size: 26px;
      }
      .expanding-card .open {
        display: flex;
        margin-left: 10px;
        padding: 8px;
        padding-right: 50px;
      }
      .expanding-card .open .right {
        margin-left: 34px;
        margin-top: 12px;
      }
      .expanding-card .open .iconborder {
        background: #02A8F3;
        border-radius: 50px;
        border: 13px solid #02A8F3;
        display: inline-block;
        height: 70px;
        width: 70px;
      }
      .expanding-card . {
        color: #757575;
      }
    */},

    function outClosedHTML() {/*
      <div class="closed">
        <span class="icon"></span>
        $$toggle{model_: 'foam.ui.md.FlatButton'}
      </div>
    */},

    function outOpenHTML() {/*
      <div class="open">
        <span class="iconborder"><span class="icon"></span></span>
        <div class="right">
          Larger expanded View<br>
          With more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          And more stuff<br>
          $$toggle{model_: 'foam.ui.md.FlatButton'}
        </div>
      </div>
    */},

    function toHTML() {/*
      <div id="%%id" class="expanding-card">
        <% if ( this.expanded ) {
          this.outOpenHTML(out);
        } else {
          this.outClosedHTML(out);
        } %>
      </div>
    */}
  ],

  actions: [
    {
      name: 'toggle',
      code: function() { this.expanded = ! this.expanded; }
    }
  ]
});
