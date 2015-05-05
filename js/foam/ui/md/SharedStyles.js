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
  name: 'SharedStyles',
  package: 'foam.ui.md',
  extendsModel: 'foam.ui.SimpleView',
  templates: [
    function CSS() {/*
body {
  font-family: Roboto, 'Helvetica Neue', Helvetica, Arial;
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

.mdui-app-controller {
  background: white;
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
  -webkit-flex-direction: column;
  height: 100%;
}

.mdui-app-controller .header {
  display: flex;
  display: -webkit-flex;
  background: #3e50b4;
  flex-shrink: 0;
  -webkit-flex-shrink: 0;
  padding: 0;
  height: 56px;
}

.mdui-app-controller .header .default {
  flex: 1.0;
  -webkit-box-flex: 1.0;
  display: flex;
  display: -webkit-flex;
  margin: 4px;
  flex-grow: 1.0;
  -webkit-flex-grow: 1.0;
}

.mdui-app-controller.searchMode .header {
  height: 50px;
}

.mdui-app-controller.searchMode .header .default {
  display: none;
}

.mdui-app-controller:not(.searchMode) .header .search {
  display: none;
}

.mdui-app-controller.searchMode .header .search {
  display: inherit;
  height: 50px;
  width: 100%;
  background: #3e50b4;
  z-index: 2;
}

.swipeAltInner {
  overflow: hidden;
}

.mdui-app-controller.searchMode .swipeAltHeader {
  display: none;
}

.mdui-app-controller .header .name {
  -webkit-align-self: center;
  -webkit-box-flex: 1.0;
  -webkit-flex-grow: 1.0;
  align-self: center;
  color: white;
  flex-grow: 1.0;
  flex: 1.0;
  font-size: 20px;
  font-weight: 500;
  margin-left: 16px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}

input[name=q] {
  -webkit-align-self: center;
  align-self: center;
  background: #3e50b4;
  border: none;
  color: white;
  font-size: 20px;
  height: 30px;
  margin: 13px 20px 13px 6px;
  padding-left: 10px;
  width: 100%;
}

input[name=q]:focus {
  outline: none;
  opacity: 0.76;
}

input[name=q]::-webkit-input-placeholder {
  font-size: 20px;
  color: white;
  opacity: 0.76;
  height: 55px;
}

.backButton {
  margin: 3px 6px 2px 4px;
}

.header canvas {
  background: #3e50b4
}

.body canvas {
  background: white;
}

.popupChoiceView {
  padding: 0;
}

.md-floating-label-container {
  align-items: center;
  display: flex;
  padding: 36px 16px 8px;
  position: relative;
}

.md-floating-label {
  color: #999;
  flex-grow: 1;
  font-size: 12px;
  font-weight: 500;
  position: absolute;
  top: 16px;
  z-index: 0;
}

canvas.createButton {
  position: absolute;
  bottom: 10px;
  right: 20px;
  z-index: 10;
  background: rgba(0,0,0,0);
  box-shadow: 3px 3px 3px #aaa;
  border-radius: 30px;
}


.md-card-shell {
  display: block;
  background: #fff;
  margin: 10px;
}

.md-card {
  background: #fff;
  display: block;
  margin: 10px;
  padding: 10px;
}

.md-card p, .md-card-shell p {
  width: initial;
}

.md-style-trait-standard {
  padding: 8px;
  margin: 8px;
}

.md-style-trait-inline {
  padding: 0px;
}


@media not print {
  .md-card-shell, .md-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
    margin: 10px;
    border-radius: 3px;
  }
}

@media print {
  .md-card-shell, .md-card {
    border: 6px double #000;
    margin: 6pt;
    page-break-inside: avoid;
  }
}
*/},
  ],
});
