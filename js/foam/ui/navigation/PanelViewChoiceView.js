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
  package: 'foam.ui.navigation',
  name: 'PanelViewChoiceView',
  extends: 'foam.ui.DetailView',
  help: 'A view that takes a ViewChoiceController and lists all of the ' +
      'ViewChoice labels, highlights the selected choice, has a title in it, ' +
      'and expands to the height of the screen. This view is typically used ' +
      'as the panel view in a SlidePanel.',
  requires: [
    'foam.ui.navigation.PageView',
    'foam.ui.navigation.TopToolbar',
    'foam.ui.ViewChoicesView',
  ],
  properties: [
    {
      name: 'label',
    }, 
    {
      name: 'className',
      defaultValue: 'PanelViewChoiceView',
    },
  ],
  templates: [
    function CSS() {/*
      .PanelViewChoiceView {
        background-color: white;
        -webkit-transform: translate3d(0px, 0px, 1px);
        -webkit-transform-style: preserve-3d;
      }
      .PanelViewChoiceView .viewChoicesView {
        border: none;
        width: 100%;
      }
      .PanelViewChoiceView .viewchoiceview-item {
        margin-top: 20px;
        margin-bottom: 20px;
        font-weight: bold;
        color: #212121;
      }
      .PanelViewChoiceView .viewchoiceview-item-selected,
      .PanelViewChoiceView .viewchoiceview-item:hover {
        background-color: #F2F2F2;
        color: #04A9F4;
      }
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <%=
          this.PageView.create({
            header: this.TopToolbar.create({
              label$: this.label$,
            }),
            body: this.ViewChoicesView.create({
              data: this.data,
              extraClassName: 'viewChoicesView',
              id: this.id + '-viewChoicesView'
            }),
          })
        %>
      </div>
    */}
  ]
});
