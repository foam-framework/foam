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
  package: 'foam.demos',
  name: 'HorizontalSlidingViewChoiceView',
  extends: 'foam.ui.View',
  requires: [
    'foam.ui.md.CheckboxView',
    'foam.ui.md.ToggleView',
    'foam.ui.TabbedViewChoiceView',
    'foam.ui.HorizontalSlidingViewChoiceView',
    'foam.ui.ViewChoice',
    'foam.controllers.ViewChoiceController',
  ],
  properties: [
    {
      name: 'viewChoiceController',
      factory: function() {
        var views = [
          this.ViewChoice.create({
            label: 'Checkbox',
            view: 'foam.ui.md.CheckboxView'
          }),
          this.ViewChoice.create({
            label: 'Toggle',
            view: function() {
                return foam.ui.md.ToggleView.create({
                  label: 'Toggle',
                });
            },
          }),
        ];
        return this.ViewChoiceController.create({
          views: views,
        });
      },
    },
    {
      name: 'tabView',
      factory: function() {
        return this.TabbedViewChoiceView.create({
            data: this.viewChoiceController
        });
      },
    },
    {
      name: 'view',
      factory: function() {
        return this.HorizontalSlidingViewChoiceView.create({
            data: this.viewChoiceController
        });
      },
    },
  ],
  templates: [
    function toHTML() {/*
      %%tabView
      %%view
    */},
  ]
});
