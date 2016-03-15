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
  package: 'foam.browser.u2',
  name: 'BrowserDAOCreateController',
  extends: 'foam.u2.DAOCreateController',

  requires: [
    'foam.u2.md.Toolbar',
    'foam.u2.md.ToolbarAction'
  ],

  properties: [
    {
      name: 'toolbar_',
      factory: function() {
        var t = this.Toolbar.create({ title$: this.title$ });
        t.addLeftActions([
          this.ToolbarAction.create({ data: this, action: this.CANCEL }),
        ]);
        t.addRightActions([
          this.ToolbarAction.create({ data: this, action: this.SAVE })
        ]);
        return t;
      }
    },
  ],

  methods: [
    function initE() {
      this.cls(this.myCls()).add(this.toolbar_).add(this.body_);
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      ^body {
        overflow-x: hidden;
        overflow-y: auto;
      }
    */}
  ]
});
