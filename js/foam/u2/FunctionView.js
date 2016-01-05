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
  package: 'foam.u2',
  name: 'FunctionView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.tag.TextArea',
  ],
  imports: [
    'dynamic'
  ],
  properties: [
    {
      name: 'error'
    }
  ],
  methods: [
    function initE() {
      this.start('span')
        .style({
          display: this.dynamic(function(message) { return message ? '' : 'none'; }, this.error$),
          color: 'red'
        })
        .start('div')
        .add(this.error$)
        .end()
        .end();

      var text = this.start('textarea');
      text.end();

      Events.relate(this.data$, text.data$, this.fnToText, this.textToFn.bind(this), true)
    },
    function fnToText(fn) {
      return fn.toString();
    },
    function textToFn(text) {
      try {
        this.error = '';
        return FunctionProperty.ADAPT.defaultValue.call(null, null, text);
      } catch(e) {
        this.error = e.message;
        return function(){};
      }
    }
  ]
});
