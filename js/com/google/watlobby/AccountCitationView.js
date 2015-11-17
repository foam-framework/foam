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
  package: 'com.google.watlobby',
  name: 'AccountCitationView',
  extends: 'foam.ui.md.DetailView',
  properties: [
    ['className', 'account-citation']
  ],
  templates: [
    function CSS() {/*
     .account-citation {
       align-items: center;
       border-bottom: center;
       display: flex;
       min-height: 48px;
       }*/},
    function toHTML() {/*
<div id="%%id" <%= this.cssClassAttr() %>>
  $$email{ mode: 'read-only', floatingLabel: false }$$level{ model_: 'foam.ui.TextFieldView', mode: 'read-only', floatingLabel: false }
</div>*/}
  ]
});
