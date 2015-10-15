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
  name: 'StringElideTextualView',
  extends: 'foam.ui.View',

  documentation: 'Outputs a tag containing the raw string, with text ellipsis enabled.',

  properties: [
    {
      name: 'tagName',
      defaultValue: 'div',
    },
    {
      name: 'className',
      defaultValue: 'string-elide-textual-view',
    }
  ],

  templates: [
    function toInnerHTML() {/*<div class="elide-string"><%= this.data %></div>*/},
    function CSS() {/*
      .string-elide-textual-view {
        width: 0;
        flex-grow: 1;
      }

      .string-elide-textual-view .elide-string {
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        overflow: hidden;
      }
    */},
  ]
});
