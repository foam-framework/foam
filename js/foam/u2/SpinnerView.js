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
  name: 'SpinnerView',
  extends: 'foam.u2.View',

  imports: [
    'dynamic',
  ],

  documentation: 'Renders a spinner in the Material Design style. Has a ' +
      '$$DOC{ref:".data"} property and acts like a $$DOC{ref:"BooleanView"}, ' +
      'that creates and destroys and the spinner when the value changes.',
  // TODO(braden): This spinner doesn't render on Firefox.

  properties: [
    ['data', true],
    ['color', '#4285f4'],
  ],

  constants: {
    DURATION: '1333',
  },

  templates: [
    function CSS() {/*
      <% var prefixes = ['-webkit-', '-moz-', '']; %>
      <% var bezier = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; %>
      ^ {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }
      ^fixed-box {
        position: relative;
        height: 64px;
        width: 64px;
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>transform: translate3d(0px, 0px, 0px);
        <% } %>
      }

      ^turning-box {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: container-rotate 1568ms linear infinite;
        <% } %>
        width: 100%;
        height: 100%;
      }

      ^layer {
        position: absolute;
        height: 100%;
        width: 100%;
        <% for (var j = 0; j < prefixes.length; j++) { %>
          <%= prefixes[j] %>animation: fill-unfill-rotate <%= 4*this.DURATION %>ms <%= bezier %> infinite both;
        <% } %>
      }

      ^circle-clipper {
        overflow: hidden;
        border-color: inherit;
        display: inline-block;
        height: 100%;
        position: relative;
        width: 50%;
      }

      ^circle-clipper^clipper-left ^circle {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: left-spin <%= this.DURATION %>ms <%= bezier %> infinite;
          <%= prefixes[i] %>transform: rotate(129deg);
        <% } %>
        border-right-color: transparent !important;
      }

      ^circle-clipper^clipper-right ^circle {
        <% for (var i = 0; i < prefixes.length; i++) { %>
          <%= prefixes[i] %>animation: right-spin <%= this.DURATION %>ms <%= bezier %> infinite;
          <%= prefixes[i] %>transform: rotate(-129deg);
        <% } %>
        border-left-color: transparent !important;
        left: -100%
      }

      ^circle-clipper ^circle {
        width: 200%;
      }

      ^circle {
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

      ^gap-patch {
        position: absolute;
        box-sizing: border-box;
        top: 0;
        left: 45%;
        width: 10%;
        height: 100%;
        overflow: hidden;
        border-color: inherit;
      }

      ^gap-patch ^circle {
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
    function initE() {/*#U2
      <div class="^" style="display: {{ this.dynamic(function(data) { return data ? '' : 'none'; }, this.data$) }}">
        <div class="^fixed-box">
          <div class="^turning-box">
            <div class="^layer" style="border-color: {{ this.color }}">
              <div class="^circle-clipper ^clipper-left"><div class="^circle"></div></div>
              <div class="^gap-patch"><div class="^circle"></div></div>
              <div class="^circle-clipper ^clipper-right"><div class="^circle"></div></div>
            </div>
          </div>
        </div>
      </div>
    */},
  ]
});
