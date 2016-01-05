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
  package: 'foam.demos',
  name: 'PageView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.navigation.PageView',
    'foam.ui.navigation.TopToolbar',
    'foam.ui.StaticHTML'
  ],

  templates: [
    function toHTML() {/*
      <%=
        this.PageView.create({
          header: this.TopToolbar.create({
            label: 'This is a toolbar',
          }),
          body: this.StaticHTML.create({
            content: 'Hello World',
          }),
          footer: this.TopToolbar.create({
            label: 'This is a toolbar being used as a footer',
          }),
        })
      %>
    */}
  ]
});
