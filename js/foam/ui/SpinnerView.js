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
  name: 'SpinnerView',
  extends: 'foam.ui.View',

  documentation: 'Renders a spinner in the Material Design style. Has a ' +
      '$$DOC{ref:".data"} property and acts like a $$DOC{ref:"BooleanView"}, ' +
      'that creates and destroys and the spinner when the value changes.',
  // TODO(braden): This spinner doesn't render on Firefox.
  properties: [
    {
      name: 'data',
      documentation: 'Defaults to true, so that the spinner will show itself ' +
          'by default, if data is not set.',
      defaultValue: true,
      postSet: function(old, nu) {
        if ( ! this.$ ) return;
        if ( ! nu ) {
          this.$.innerHTML = '';
          if ( this.hideContainer ) {
            this.$.style.display = 'none';
          }
        } else if ( ! old && nu ) {
          this.$.innerHTML = this.toInnerHTML();
          this.initInnerHTML();
          this.$.style.display = '';
        }
      }
    },
    {
      name: 'hideContainer',
      documentation: 'Set true to hide the outer container when data is false.',
      defaultValue: false
    },
    {
      name: 'color',
      documentation: 'The color to use for the spinner.',
      defaultValue: '#4285F4'
    },
    {
      name: 'extraClassName',
      defaultValue: 'spinner-container'
    }
  ],

  constants: {
    DURATION: '1333'
  },

  methods: {
    initHTML: function() {
      this.SUPER();
      this.data = this.data;
    }
  },

  templates: [
    function CSS() {/*
      <% var prefixes = ['-webkit-', '-moz-', '']; %>
      <% var bezier = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; %>
      .spinner-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }
      .spinner-fixed-box {
        position: relative;
        height: 64px;
        width: 64px;
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>transform: translate3d(0px, 0px, 0px);
        <% } %>
      }

      .spinner-turning-box {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: container-rotate 1568ms linear infinite;
        <% } %>
        width: 100%;
        height: 100%;
      }

      .spinner-layer {
        position: absolute;
        height: 100%;
        width: 100%;
        <% for (var j = 0; j < prefixes.length; j++) { %>
          <%= prefixes[j] %>animation: fill-unfill-rotate <%= 4*this.DURATION %>ms <%= bezier %> infinite both;
        <% } %>
      }

      .spinner-circle-clipper {
        overflow: hidden;
        border-color: inherit;
        display: inline-block;
        height: 100%;
        position: relative;
        width: 50%;
      }

      .spinner-circle-clipper.spinner-clipper-left .spinner-circle {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: left-spin <%= this.DURATION %>ms <%= bezier %> infinite;
          <%= prefixes[i] %>transform: rotate(129deg);
        <% } %>
        border-right-color: transparent !important;
      }

      .spinner-circle-clipper.spinner-clipper-right .spinner-circle {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: right-spin <%= this.DURATION %>ms <%= bezier %> infinite;
          <%= prefixes[i] %>transform: rotate(-129deg);
        <% } %>
        border-left-color: transparent !important;
        left: -100%
      }

      .spinner-circle-clipper .spinner-circle {
        width: 200%;
      }

      .spinner-circle {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        box-sizing: border-box;
        height: 100%;
        border-width: 4px;
        border-style: solid;
        border-color: inherit;
        border-bottom-color: transparent !important;
        border-radius: 50%;
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: none;
        <% } %>
      }

      .spinner-gap-patch {
        position: absolute;
        box-sizing: border-box;
        top: 0;
        left: 45%;
        width: 10%;
        height: 100%;
        overflow: hidden;
        border-color: inherit;
      }

      .spinner-gap-patch .spinner-circle {
        width: 1000%;
        left: -450%;
      }

      <% for (var i = 0; i < prefixes.length; i++) { %>
        @<%= prefixes[i] %>keyframes fill-unfill-rotate {
          12.5% { <%= prefixes[i] %>transform: rotate(135deg); }
          25%   { <%= prefixes[i] %>transform: rotate(270deg); }
          37.5% { <%= prefixes[i] %>transform: rotate(405deg); }
          50%   { <%= prefixes[i] %>transform: rotate(540deg); }
          62.5% { <%= prefixes[i] %>transform: rotate(675deg); }
          75%   { <%= prefixes[i] %>transform: rotate(810deg); }
          87.5% { <%= prefixes[i] %>transform: rotate(945deg); }
          to    { <%= prefixes[i] %>transform: rotate(1080deg); }
        }

        @<%= prefixes[i] %>keyframes left-spin {
          from { <%= prefixes[i] %>transform: rotate(130deg); }
          50%  { <%= prefixes[i] %>transform: rotate(-5deg); }
          to   { <%= prefixes[i] %>transform: rotate(130deg); }
        }

        @<%= prefixes[i] %>keyframes right-spin {
          from { <%= prefixes[i] %>transform: rotate(-130deg); }
          50%  { <%= prefixes[i] %>transform: rotate(5deg); }
          to   { <%= prefixes[i] %>transform: rotate(-130deg); }
        }

        @<%= prefixes[i] %>keyframes container-rotate {
          to { <%= prefixes[i] %>transform: rotate(360deg); }
        }
      <% } %>
    */},
    function toInnerHTML() {/*
      <div class="spinner-fixed-box">
        <div class="spinner-turning-box">
          <div class="spinner-layer" style="border-color: <%= this.color %>">
            <div class="spinner-circle-clipper spinner-clipper-left"><div class="spinner-circle"></div></div><div class="spinner-gap-patch"><div class="spinner-circle"></div></div><div class="spinner-circle-clipper spinner-clipper-right"><div class="spinner-circle"></div></div>
          </div>
        </div>
      </div>
    */}
  ]
});
