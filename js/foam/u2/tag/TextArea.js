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
  package: 'foam.u2.tag',
  name: 'TextArea',
  extends: 'foam.u2.Element',

  properties: [
    [ 'nodeName', 'textarea' ],
    {
      name: 'data',
      postSet: function(_, d) {
        if ( this.el() ) this.el().value = d;
      }
    },
    {
      type: 'Boolean',
      name: 'onKey',
      attribute: true,
      defaultValue: false,
      documentation: 'When true, $$DOC{ref:".data"} is updated on every ' +
          'keystroke, rather than on blur.',
    },
  ],

  methods: [
    function initE() {
      this.cls(this.myCls());
      this.on(this.onKey ? 'input' : 'change', this.onInput);
    },
    function load() {
      this.SUPER();
      this.data = this.data;
    }
  ],

  listeners: [
    {
      name: 'onInput',
      code: function() {
        if ( this.el() ) this.data = this.el().value;
      }
    }
  ]
});
