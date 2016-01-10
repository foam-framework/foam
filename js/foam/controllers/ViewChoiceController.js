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
  package: 'foam.controllers',
  name: 'ViewChoiceController',
  properties: [
    {
      type: 'Array',
      name: 'views',
      subType: 'foam.ui.ViewChoice',
      help: 'View choices.',
      postSet: function() {
        this.choice = this.choice;
      }
    },
    {
      name: 'choice',
      preSet: function(_, c) {
        if (typeof c !== 'number') {
          return '';
        } else {
          return Math.max(0, Math.min(c, this.views.length));
        }
      },
      postSet: function() {
        if (typeof this.choice !== 'number') {
          this.viewChoice = '';
        } else {
          this.viewChoice = this.views[this.choice];
        }
      }
    },
    {
      name: 'viewChoice',
      postSet: function() {
        this.viewFactory = this.viewChoice ?
          this.viewChoice.view : function() {};
      }
    },
    {
      name: 'viewFactory',
      view: 'foam.ui.ViewFactoryView',
    }
  ]
});
