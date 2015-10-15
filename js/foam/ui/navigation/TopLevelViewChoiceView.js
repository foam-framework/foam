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
  name: 'TopLevelViewChoiceView',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.graphics.ActionButtonCView',
    'foam.ui.SlidePanel',
    'foam.ui.ViewFactoryView',
    'foam.ui.navigation.PageView',
    'foam.ui.navigation.PanelViewChoiceView',
    'foam.ui.navigation.TopToolbar',
  ],
  exports: [
    'topToolbar',
  ],
  help: 'A view that takes a ViewChoiceController and renders the ' +
      'ViewChoices as a list in a slide out panel and the selected view on a ' +
      'main view with a toolbar containing the label of the selected view ' +
      'and a button to bring the menu out.',
  properties: [
    {
      name: 'data',
      postSet: function(oldVal, newVal) {
        if (typeof newVal.choice !== 'number') {
          newVal.choice = 0;
        }
        if (oldVal) {
          oldVal.removePropertyListener('viewFactory', this.dismissPanel);
        }
        newVal.addPropertyListener('viewFactory', this.dismissPanel);
      }
    },
    {
      name: 'label',
      documentation: 'The label to put at the top of the slide out panel.',
    },
    {
      name: 'panelWidth',
      documentation: 'The width of the panel that slides out.',
      postSet: function(_, newVal) {
        if (this.view) {
          this.view.minPanelWidth = newVal;
        }
      },
      defaultValue: 239,
    },
    {
      name: 'minWidth',
      postSet: function(_, newVal) {
        if (this.view) {
          this.view.minWidth = newVal;
        }
      },
      defaultValue: 1200,
    },
    {
      name: 'topToolbar',
      factory: function() {
        return this.TopToolbar.create();
      },
      postSet: function(_, newVal) {
        newVal.leftActionView =  this.ActionButtonCView.create({
          action: this.TOGGLE_PANEL,
          data: this,
          alpha: 1,
          width: 48,
          height: 44,
          iconWidth: 24,
          iconHeight: 24,
        });

        Events.map(this.data.viewChoice$, newVal.label$,
            function(c) { return c.label; });
      },
    },
    {
      name: 'panelView',
      factory: function() {
        return this.PanelViewChoiceView.create({
          data: this.data,
          label: this.label,
        });
      },
    },
    {
      name: 'mainView',
      factory: function() {
        var view = this.PageView.create({
          header: this.topToolbar,
        });
        view.body = this.ViewFactoryView.create(undefined, view.Y);
        Events.follow(this.data.viewFactory$, view.body.data$);
        return view;
      },
    },
    {
      name: 'view',
      factory: function() {
        var view = this.SlidePanel.create({
          mainView: this.mainView,
          minPanelWidth: this.panelWidth,
          minWidth: this.minWidth,
          panelRatio: 0,
          panelView: this.panelView,
          side: this.SlidePanel.LEFT,
          stripWidth: 0,
        });
        return view;
      },
    },
    {
      name: 'className',
      defaultValue: 'TopLevelViewChoiceView',
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
      code: function() {
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
      .TopLevelViewChoiceView {
        overflow: hidden;
      }
    */},
    function toHTML() {/*
      <div <%= this.cssClassAttr() %>>%%view</div>
    */}
  ]
});
