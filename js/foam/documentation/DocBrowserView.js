/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  package: 'foam.documentation',
  name: 'DocBrowserView',

  extends: 'foam.ui.DetailView',

  methods: {
   initHTML: function() {
     this.data.modelListView.initHTML();
     this.data.selectionView.initHTML();
   }
  },

  templates: [
    function CSS() {/*
      body {
        margin: 0px;
        font-family: 'Roboto', sans-serif;
        font-size: inherit;

        background-color: #e0e0e0;
        position: relative;

      }
      div.clear {
        clear: both;
      }
      div.introduction {
        border-top: 0.1em solid black;
        border-bottom: 0.1em solid black;
      }

      .outermost {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .docbrowser-header {
        height: 90px;
        position: relative;
        color: #fff;
        z-index: 1;
        flex-shrink: 0;
      }

      .docbrowser-header-inner {
        background-color: #5555FF;
        position: absolute;
        height: 120px;
        width: 100%;
        flex-shrink: 0;
      }

      .docbrowser-header-flex-container {
        display: flex;
        flex-shrink: 0;
        justify-content: space-around;
        margin: 0 50px;
      }
      .docbrowser-header-contents {
        flex-grow: 1;
        flex-shrink: 0;
        max-width: 1280px;

        display: flex;
        justify-content: space-between;
      }

      .docbrowser-title {
        font-weight: lighter;
        font-size: 250%;
        margin-top: 20px;
      }
      .docbrowser-tabs {
        font-size: 120%;
        font-weight: lighter;
        margin-top: 40px;
        margin-right: 20px;
      }
      .docbrowser-tab {
        margin-left: 50px;
      }
      .docbrowser-tab.enabled {
        font-weight: normal;
      }

      .outer-container {
        margin: 0 30px;
        z-index: 2;
        position: relative;
        display:flex;
        flex-direction: column;

        flex-shrink: 1;
        flex-basis: 10000px;
      }
      .outer-flex-container {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-bottom: 60px;
        width: 100%;
        flex-grow: 1;
 //       height: 83%;
      }
      .inner-container {
        background-color: #fff;
        border: 1px solid #888;
        border-radius: 12px;
        flex-grow: 1000;
        flex-shrink: 1;
        flex-basis: 1px;
        max-width: 1280px;
        padding: 15px;
        box-shadow: 0px 5px 5px #888888;
        display:flex;
      }

      input {
        font-family: inherit;
        font-size: inherit;
      }

      p {
        padding-bottom: 0.5em;
      }
      li {
        padding-bottom: 0.5em;
      }

      div.listPane {
        min-width: 200px;
        flex-basis: 200px;
        order: 1;
        padding: 1em;
        flex-grow: 0;
        overflow-x: hidden;

        display: flex;
        flex-direction: column;
      }

      div.detailPane {
        order: 2;
        flex-grow: 10;
        overflow-y: scroll;
        padding: 1em;
      }

      div.detailPane div.chapters h2 {
        font-size: 110%;
      }

      div.search-field-container {
        flex-grow: 0;
        flex-shrink: 0;
        order: 1;
        padding: 0;
        margin-left: -15;
      }

      div.list-container {
        font-size: 80%;
        order: 2;
        flex-grow: 1;
        overflow-y:scroll;
        overflow-x:hidden;
      }
      div.list-container span.docLink {
        border-bottom: none;
      }


    */},
    function toHTML() {/*
      <div class="outermost" id="<%= this.id %>">
        <div class="docbrowser-header">
          <div class="docbrowser-header-inner">
            <div class="docbrowser-header-flex-container">
              <div class="docbrowser-header-contents">
                <div class="docbrowser-title"><img src="images/browsertitle-lg.png" alt="FOAM API Reference"/></div>
              </div>
            </div>
          </div>
        </div>

        <div id="<%= this.id %>-outer-container" class="outer-container">
          <div class="outer-flex-container">
            <div id="<%= this.id %>-inner-container" class="inner-container">
                <div class="listPane"><%=this.data.modelListView.toHTML()%></div>
                <div class="detailPane"><%=this.data.selectionView.toHTML()%></div>
            </div>
          </div>
        </div>
      </div>
    */}
  ]


});
