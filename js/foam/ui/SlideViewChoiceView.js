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
  name: 'SlideViewChoiceView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.ui.SlidePanel',
    'foam.ui.ViewChoicesView',
    'foam.ui.ViewFactoryView'
  ],

  help: 'A view that takes a ViewChoiceController and renders the ' +
      'ViewChoices as a list in a slide out panel and the selected view on a ' +
      'main view.',

  properties: [
    {
      name: 'data',
      postSet: function(_, newVal) {
        if (newVal.choice === undefined) {
          newVal.choice = 0;
        }
        this.data.addPropertyListener('viewFactory', this.dismissPanel);
      }
    },
    {
      name: 'minPanelWidth',
      postSet: function(_, newVal) {
        if (this.view) {
          this.view.minPanelWidth = newVal;
        }
      }
    },
    {
      name: 'minWidth',
      postSet: function(_, newVal) {
        if (this.view) {
          this.view.minWidth = newVal;
        }
      }
    },
    {
      name: 'panelView',
      factory: function() {
        return this.ViewChoicesView.create({
          data: this.data,
        });
      },
    },
    {
      name: 'view',
      factory: function() {
        var view = this.SlidePanel.create({
          side: this.SlidePanel.LEFT,
          stripWidth: 0,
          minPanelWidth: this.minPanelWidth,
          minWidth: this.minWidth,
          panelView: this.panelView,
          panelRatio: 0,
          mainView: function() {
            return this.ViewFactoryView.create({
              data$: this.data.viewFactory$
            });
          }.bind(this)
        });
        return view;
      },
    },
    {
      name: 'className',
      defaultValue: 'slideviewchoiceview-container'
    },
  ],

  actions: [
    {
      name: 'togglePanel',
      label: '',
      iconUrl: 'https://www.google.com/images/icons/material/system/2x/menu_white_24dp.png',
      isAvailable: function() {
        return this.view.state == this.SlidePanel.OPEN ||
            this.view.state == this.SlidePanel.CLOSED;
      },
      action: function() {
        this.view.state = this.view.state == this.SlidePanel.OPEN ?
            this.SlidePanel.CLOSED :
            this.SlidePanel.OPEN;
      },
    },
  ],

  listeners: [
    {
      name: 'dismissPanel',
      code: function() {
        if (this.view.state == this.SlidePanel.OPEN) {
          this.view.state = this.SlidePanel.CLOSED;
        }
      },
    },
  ],

  templates: [
    function CSS() {/*
      .slideviewchoiceview-container {
        display: flex;
        background-color: #EEEEEE;
      }
    */},
    function toHTML() {/*
      %%view
    */}
  ]
});
