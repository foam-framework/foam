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
  name: 'CitationView',
  package: 'foam.apps.builder.datamodels.meta.types',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.datamodels.meta.types.EditView',
    'foam.ui.md.PopupChoiceView',
  ],

  imports: [
    'mode',
    'stack',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'meta-citation-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    }
  ],

  actions: [
    {
      name: 'edit',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      ligature: 'edit',
      isAvailable: function() { return this.mode == 'read-write'; },
      code: function() {
        this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
        var edit = this.EditView.create({ data: this.data, model: this.data.model_ });
        this.stack.pushView(edit);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="meta-citation-view-labels">
          $$name{ model_:'foam.ui.StringElideTextualView', extraClassName: 'meta-citation-view-title' }
          $$label{ model_:'foam.ui.StringElideTextualView', extraClassName: 'md-grey meta-citation-view-editors' }
        </div>
        $$edit{ color: 'black' }
      </div>
    */},
    function CSS() {/*
      .meta-citation-view {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-grow: 1;
        background: white;
        border-bottom: 1px solid #eee;
        min-height: 48px;
      }
      .meta-citation-view-labels {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        margins: auto 16px;
        flex-basis: 100%;
      }

      .meta-citation-view-title {
        flex-basis: 20%;
      }
      .meta-citation-view-editors {
        flex-basis: 80%;
      }
    */},

  ]

});

