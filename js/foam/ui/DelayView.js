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
  name: 'DelayView',
  extends: 'foam.ui.SimpleView',
  help: 'A view that shows a spinner until it renders the viewFactory ' +
      'after a delay.',
  requires: [
    'foam.ui.FutureView',
  ],
  imports: [
    'setTimeout'
  ],
  properties: [
    {
      name: 'delay',
      defaultValue: 2000,
    },
    {
      name: 'viewFactory',
    },
    {
      name: 'future_',
      factory: function() {
        return afuture();
      },
    },
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      var self = this;
      this.setTimeout(function() {
        self.future_.set();
      }, this.delay);
    },
  },
  templates: [
    function toHTML() {/*
      <%=
        this.FutureView.create({
          future: this.future_,
          innerView: this.viewFactory,
        })
      %>
    */}
  ],
});
