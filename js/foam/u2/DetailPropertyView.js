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
  name: 'DetailPropertyView',
      
  extends: 'foam.u2.PropertyView',
  
  templates: [
    function CSS() {/*
      .foam-u2-PropertyView-label {
        color: #444;
        display: block;
        float: left;
        font-size: 13px;
        padding-left: 6px;
        padding-top: 6px;
        text-align: right;
        vertical-align: top;
      }
      .foam-u2-PropertyView-units  {
        color: #444;
        font-size: 12px;
        padding: 4px;
        text-align: right;
      }
    */}
  ],

  methods: [
    function initE() {
      var prop = this.prop;
      this.cls('foam-u2-PropertyView').add(
        E('td').cls('foam-u2-PropertyView-label').add(prop.label),
        E('td').cls('foam-u2-PropertyView-view').add(
          this.child_,
          prop.units && E('span').cls('foam-u2-PropertyView-units').add(prop.units)));
    }
  ]
});
