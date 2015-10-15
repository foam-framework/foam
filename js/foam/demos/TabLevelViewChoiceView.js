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
  name: 'TabLevelViewChoiceView',
  extends: 'foam.ui.View',
  requires: [
    'foam.controllers.ViewChoiceController',
    'foam.ui.StaticHTML',
    'foam.ui.ViewChoice',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.ToggleView',
    'foam.ui.navigation.TabLevelViewChoiceView',
    'foam.ui.navigation.TopLevelViewChoiceView',
  ],
  properties: [
    {
      name: 'view',
      factory: function() {
        var views = [
          this.ViewChoice.create({
            label: 'Tabs',
            view: function() {
              return this.X.foam.ui.navigation.TabLevelViewChoiceView.create({
                data: this.X.foam.controllers.ViewChoiceController.create({
                  views: [
                    this.X.foam.ui.ViewChoice.create({
                      label: 'HTML',
                      view: {
                        factory_: 'foam.ui.StaticHTML',
                        content: '<div style="height: 4000px">Hello</div>'},
                    }, this.Y),
                    this.X.foam.ui.ViewChoice.create({
                      label: 'Toggle',
                      view: 'foam.ui.md.CheckboxView'
                    }, this.Y),
                    this.X.foam.ui.ViewChoice.create({
                      label: 'Toggle',
                      view: function() {
                        return this.X.foam.ui.md.ToggleView.create({
                          label: 'Toggle',
                        }, this.Y);
                      },
                    }, this.Y),
                  ],
                }, this.Y),
              }, this.Y);
            },
          }),
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
        var viewChoiceController = this.ViewChoiceController.create({
          views: views,
        });
        return this.TopLevelViewChoiceView.create({
            label: 'Test App',
            data: viewChoiceController
        });
      },
    },
  ],
  templates: [
    function toHTML() {/*
      %%view
    */},
  ]
});
