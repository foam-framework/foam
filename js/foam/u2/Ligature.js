/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  name: 'Ligature',
  extends: 'foam.u2.View',

  properties: [
    ['nodeName', 'i'],
    ['fontSize', 24],
    ['color', 'currentColor'],
  ],

  methods: [
    function initE() {
      this.cls('material-icons-extended');
      this.style({
        color: this.color$,
        'font-size': this.dynamic(function(fs) {
          return fs + 'px';
        }, this.fontSize$)
      });
      this.add(this.data$);
    },
  ]
});
