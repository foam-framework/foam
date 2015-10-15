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
  package: 'foam.ui.navigation',
  name: 'PageView',
  extends: 'foam.ui.SimpleView',
  help: 'A view that takes and renders a header, body, and footer. The ' +
      'header and footer views are required to have a preferredHeight ' +
      'property and this view gives the body the rest of the height on the ' +
      'screen.',
  exports: [
    'bodyHeight$',
  ],
  properties: [
    {
      name: 'className',
      defaultValue: 'PageView',
    },
    {
      name: 'header',
      postSet: function(oldVal, newVal) {
        if (oldVal) {
          oldVal.removePropertyListener('preferredHeight', this.onResize);
        }
        newVal.addPropertyListener('preferredHeight', this.onResize);
      },
    },
    {
      name: 'body',
    },
    {
      name: 'bodyHeight',
    },
    {
      name: 'footer',
      postSet: function(oldVal, newVal) {
        if (oldVal) {
          oldVal.removePropertyListener('preferredHeight', this.onResize);
        }
        newVal.addPropertyListener('preferredHeight', this.onResize);
      },
    },
  ],
  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function() {
        if (this.$) {
          var windowHeight = this.X.window.innerHeight;
          this.$.style.height = windowHeight + 'px';

          var headerHeight = this.header ? this.header.preferredHeight : 0;
          var footerHeight = this.footer ? this.footer.preferredHeight : 0;
          var availableBodyHeight = windowHeight -
              (headerHeight + footerHeight);

          var bodyContainer = document.getElementById(this.id + '-body');
          bodyContainer.style.height = availableBodyHeight + 'px';
          bodyContainer.style.top = headerHeight;
          this.bodyHeight = availableBodyHeight;

          var footerContainer = document.getElementById(this.id + '-footer');
          footerContainer.style.top = headerHeight + availableBodyHeight;
        }
      },
    }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.onResize();
      this.X.window.addEventListener('resize', this.onResize);
    },
  },
  templates: [
    function CSS() {/*
      .PageView {
        overflow: hidden;
      }
      .PageView .positioned-view {
        left: 0;
        overflow-y: auto;
        position: absolute;
        transition: top 0.3s linear;
        width: 100%;
      }
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        %%header
        <div class="positioned-view" id="%%id-body">%%body</div>
        <div class="positioned-view" id="%%id-footer">%%footer</div>
      </div>
    */}
  ]
});
