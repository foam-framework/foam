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
  name: 'ToolbarCSS',
  package: 'foam.ui.md',
  templates: [
    function CSS() {/*
      .header {
        align-items: center;
        background-color: #3e50b4;
        box-shadow: 0 1px 1px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.15);
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        height: 56px;
        padding: 4px;
        width: 100%;

        color: #fff;
        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
      }

      .header canvas {
        flex-grow: 0;
        flex-shrink: 0;
      }
      .header img {
        flex-grow: 0;
        flex-shrink: 0;
      }

      .header .grow {
        flex-grow: 1;
        flex-shrink: 1;
      }

      .header .actionButton {
        background: #3e50b4;
        border: none;
        box-shadow: none;
        display: none;
        opacity: 0.76;
        outline: none;
        vertical-align: middle;
      }

      .header .actionButton.available {
        display: block;
      }

      .header .header-text {
        overflow: hidden;
        padding: 0px 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .header input {
        color: #fff;
      }
    */}
  ]
});
