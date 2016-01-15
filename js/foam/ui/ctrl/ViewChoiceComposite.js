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
  package: 'foam.ui.ctrl',
  name: 'ViewChoiceComposite',
  documentation: function() {/*
    Represents a node in a tree of ViewChoiceComposites that has a view of its
    own (unselectedViewFactory), a label, and children views.
  */},
  traits: [
    'foam.memento.MemorableTrait'
  ],
  properties: [
    {
      name: 'label',
    },
    {
      type: 'ViewFactory',
      name: 'unselectedViewFactory',
      documentation: 'The view factory when no view is selected.',
      factory: function() { return function() {}; },
      postSet: function() { this.choice = this.choice; }
    },
    {
      type: 'Array',
      name: 'views',
      documentation: 'An array of ViewChoiceComposites.',
      postSet: function() {
        this.choice = this.choice;
      },
    },
    {
      name: 'choice',
      memorable: true,
      adapt: function(_, v) {
        v = parseInt(v);
        if (Number.isNaN(v)) return '';
        return v;
      },
      preSet: function(_, c) {
        if (typeof c !== 'number' || !this.views.length) {
          return '';
        } else {
          return Math.max(0, Math.min(c, this.views.length));
        }
      },
      postSet: function() {
        if ( typeof this.choice === 'number' )
          this.selectedChild = this.views[this.choice];
        else {
          this.selectedChild = '';
          this.viewFactory = this.unselectedViewFactory;
        }
      }
    },
    {
      name: 'selectedChild',
      memorable: true,
      postSet: function(oldVal, newVal) {
        if (oldVal) Events.unfollow(oldVal.viewFactory$, this.viewFactory$);
        if (newVal) Events.follow(newVal.viewFactory$, this.viewFactory$);
      }
    },
    {
      type: 'ViewFactory',
      name: 'viewFactory',
      view: 'foam.ui.ViewFactoryView',
    }
  ]
});
