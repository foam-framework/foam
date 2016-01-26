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
  package: 'foam.u2.md',
  name: 'SharedStyles',
  extends: 'foam.u2.Element',
  templates: [
    function CSS() {/*
      body, .md-font, .md-quote {
        font-family: Roboto, 'Helvetica Neue', Helvetica, Arial;
        -webkit-font-smoothing: antialiased;
      }

      p {
        margin: 0;
      }

      p + p {
        margin-top: 1em;
      }

      table {
        border-spacing: 0;
      }

      * {
        box-sizing: border-box;
      }

      body, tbody, tr, td {
        margin: 0;
        padding: 0;
      }

      hr {
        border-top: 1px solid rgba(0,0,0,.1);
        border: none;
        height: 1px;
        margin: 0;
        padding: 0;
        background: rgba(0,0,0,.1);
      }

      a {
        text-decoration: none;
        color: #4285f4;
      }

      .noselect {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .foam-u2-md-toolbar-colors {
        background-color: #3e50b4;
        color: #fff;
      }
    */},
  ]
});
