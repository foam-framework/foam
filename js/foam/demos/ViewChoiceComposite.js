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
  name: 'ViewChoiceComposite',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.memento.FragmentMementoMgr',
    'foam.ui.ViewChoicesView',
    'foam.ui.ViewFactoryView',
    'foam.ui.ctrl.AlwaysSelectedViewChoiceComposite',
    'foam.ui.ctrl.ViewChoiceComposite',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.ToggleView',
  ],
  properties: [
    {
      name: 'view',
      factory: function() {
        var moreViews = this.ViewChoiceComposite.create({
          label: 'More Views',
          views: [
              this.ViewChoiceComposite.create({
                label: 'ToggleView2',
                unselectedViewFactory: 'foam.ui.md.ToggleView',
              }),
              this.ViewChoiceComposite.create({
                label: 'CheckboxView2',
                unselectedViewFactory: 'foam.ui.md.CheckboxView',
              }),
          ],
        });
        moreViews.unselectedViewFactory = {
          factory_: 'foam.ui.ViewChoicesView',
          data: moreViews,
        };

        var views = this.ViewChoiceComposite.create({
          views: [
            this.ViewChoiceComposite.create({
              label: 'ToggleView',
              unselectedViewFactory: 'foam.ui.md.ToggleView',
            }),
            this.AlwaysSelectedViewChoiceComposite.create({
              label: 'CheckboxView',
              views: [
                this.ViewChoiceComposite.create({
                    unselectedViewFactory: 'foam.ui.md.CheckboxView',
                }),
              ]
            }),
            moreViews
          ],
        });
        views.unselectedViewFactory = {
          factory_: 'foam.ui.ViewChoicesView',
          data: views,
        };

        return views;
      },
    },
    {
      name: 'mementoMgr',
      hidden: true,
      factory: function() {
        return this.FragmentMementoMgr.create({
          mementoValue: this.view.memento$
        });
      }
    },
  ],
  templates: [
    function toHTML() {/*
      <%= this.ViewFactoryView.create({
        data$: this.view.viewFactory$
      }) %>
    */},
  ]
});
