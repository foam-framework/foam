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
  name: 'ProgressView',

  extendsModel: 'foam.ui.View',

  properties: [
    {
      //model_: 'FloatProperty',
      name: 'data',
      postSet: function () { this.updateValue(); }
    }
  ],

  templates: [
    function CSS() {/*
      .progressView {
        margin: 2px 0 0 10px;
        height: 23px;
        width: 183px;
      }
    */},
  ],

  methods: [
    function toHTML() {
      return '<progress class="progressView" value="25" id="' + this.id + '" max="100" >25</progress>';
    },

    function updateValue() {
      var e = this.$;
      if (!e) return;

      e.value = typeof this.data === 'number' ? this.data : parseInt(this.data);
    },

    function initHTML() {
      this.updateValue();
    }
  ]
});
