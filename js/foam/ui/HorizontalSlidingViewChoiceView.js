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
  package: 'foam.ui',
  name: 'HorizontalSlidingViewChoiceView',
  extends: 'foam.ui.DetailView',
  help: 'A view that typically takes a ViewChoiceController and renders the ' +
      'selected view. When the selected view changes a left/right animation ' +
      'is used to transition to the active view.',
  properties: [
    {
      name: 'data',
      postSet: function(_, newVal) {
        if (typeof newVal.choice !== 'number') {
          newVal.choice = 0;
        }
      }
    },
    {
      name: 'className',
      defaultValue: 'HorizontalSlidingViewChoiceView',
    },
    {
      name: 'height',
      defaultValue: '100px',
      postSet: function(_, newVal) {
        if (this.$) this.$.style.height = newVal;
      },
    },
  ],
  methods: {
    setCurrentTransform: function() {
      var translate = 'translate3d(-' + (this.data.choice * 100) + '%,0,0)';
      var carousel = document.getElementById(this.id + '-carousel');
      carousel.style.transform = translate;
      carousel.style.webkitTransform = translate;
    },
    initHTML: function() {
      this.SUPER();
      var carousel = document.getElementById(this.id + '-carousel');
      carousel.style.display = '';
      this.setCurrentTransform();
      var self = this;
      var destructor = Events.dynamicFn(
          function() { self.data.choice; },
          this.setCurrentTransform.bind(this));
      this.addDestructor(destructor.destroy.bind(destructor));
    }
  },
  templates: [
    function CSS() {/*
      .HorizontalSlidingViewChoiceView {
        display: -webkit-flex;
        display: flex;
        overflow-x: hidden;
        overflow-y: hidden;
      }
      .HorizontalSlidingViewChoiceView .carousel-container {
        -webkit-flex: 1 1 1px;
        -webkit-transition: -webkit-transform 0.5s cubic-bezier(0.35, 0, 0.25, 1), width 0.225s cubic-bezier(0.35, 0, 0.25, 1);
        flex: 1 1 1px;
        transition: transform 0.5s cubic-bezier(0.35, 0, 0.25, 1), width 0.225s cubic-bezier(0.35, 0, 0.25, 1);
        white-space: nowrap;
      }
      .HorizontalSlidingViewChoiceView .carousel-view {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        position: absolute;
        top: 0;
        width: 100%;
      }
    */},
    function renderView(_, view, i) {/*
      <div class="carousel-view" style="left: <%= i*100 %>%">
        <%= view.view() %>
      </div>
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %> style="height: <%= this.height %>">
        <div class='carousel-container' id="%%id-carousel" style="display: none;">
          <%
            for ( var i = 0, view; view = this.data.views[i]; i++ ) {
              this.renderView(out, view, i);
            }
          %>
        </div>
      </div>
    */},
  ]
});
