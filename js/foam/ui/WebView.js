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
  name: 'WebView',
  extendsModel: 'foam.ui.SimpleView',
  imports: [
    'window',
  ],
  help: 'A view that renders the HTML given to it.',
  properties: [
    {
      name: 'data',
    },
    {
      name: 'intervalId',
    },
  ],
  methods: {
    toHTML: function() {
      var id = this.id;
      return '<iframe id="' + id + '"></iframe>';
    },
    initHTML: function() {
      this.SUPER();

      this.$.contentDocument.write(this.data);
      // This is a lazy way of handling the change in size when things like
      // images load asynchronously.
      this.intervalId = this.window.setInterval(this.onResize, 500);
      this.onResize();
    },
    destroy: function() {
      this.window.clearInterval(this.intervalId);
    },
  },
  listeners: [
    {
      name: 'onResize',
      isMerged: 500,
      code: function() {
        this.$.style.height = this.$.contentDocument.documentElement.offsetHeight;
      }
    }
  ]
});
