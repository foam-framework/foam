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
  name: 'OverlayView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.View',
  properties: [
    {
      name: 'delegate'
    },
    {
      name: 'title',
      defaultValueFn: function() {
        return this.delegate && (this.delegate.label ||
          (this.delegate.model_ && this.delegate.model_.label));
      }
    },
    {
      name: 'opened',
      defaultValue: false
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'className',
      defaultValue: 'overlay'
    }
  ],

  listeners: [
    {
      name: 'open',
      documentation: 'Re-renders the overlay and makes sure it is open. Safe to call multiple times.',
      code: function(opt_view) {
        if (opt_view) this.delegate = opt_view;
        this.opened = true;
        this.updateHTML();
        this.$.style.display = 'block';
      }
    },
    {
      name: 'close',
      code: function() {
        this.opened = false;
        this.$.style.display = 'none';
      }
    }
  ],

  templates: [
    function CSS() {/*
      .overlay {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .overlay-inner {
        display: flex;
        align-items: center;
        justify-content: center;

        position: relative;
        height: 100%;
        width: 100%;
      }
      .overlay-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #000;
        opacity: 0.5;
        z-index: 5;
      }
      .overlay-container {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 20px;
        z-index: 10;
      }
      .overlay-container .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 12px;
      }
    */},
    function toInnerHTML() {/*
      <div class="overlay-inner">
        <div id="<%= this.id %>-background" class="overlay-background"></div>
        <div class="overlay-container">
          <div class="title">%%title</div>
          <%= this.delegate %>
        </div>
      </div>
      <% this.on('click', this.close, this.id + '-background'); %>
    */}
  ]
});
