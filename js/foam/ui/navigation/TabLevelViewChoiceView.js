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
  name: 'TabLevelViewChoiceView',
  extends: 'foam.ui.SimpleView',
  help: 'A view that takes a ViewChoiceController as data and renders the ' +
      'views in a HorizontalSlidingViewChoiceView and places a ' +
      'TabLevelViewChoiceView in the topToolbar that it imports.',
  requires: [
    'foam.ui.HorizontalSlidingViewChoiceView',
    'foam.ui.TabbedViewChoiceView',
  ],
  imports: [
    'topToolbar',
    'bodyHeight$ as height$',
  ],
  properties: [
    {
      name: 'data',
      postSet: function(_, newVal) {
        if (typeof newVal.choice !== 'number') {
          newVal.choice = 0;
        }
        var self = this;
        this.topToolbar.extraView = function() {
          return self.TabbedViewChoiceView.create({
            data: newVal,
          });
        };
      },
    },
    {
      name: 'view',
      factory: function() {
        return this.HorizontalSlidingViewChoiceView.create(undefined);
      },
      postSet: function(old, view) {
        if ( old ) {
          Events.unfollow(this.data$, old.data$);
          Events.unfollow(this.height$, view.height$);
        }
        Events.follow(this.data$, view.data$);
        Events.follow(this.height$, view.height$)
      }
    },
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
    },
    destroy: function() {
      if (this.topToolbar) {
        this.topToolbar.extraView = function() {};
      }
      this.SUPER();
    },
  },
  templates: [
    function toHTML() {/*
      %%view
    */}
  ]
});
