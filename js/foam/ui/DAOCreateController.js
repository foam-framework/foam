/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved
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
  name:  'DAOCreateController',
  label: 'DAO Create',

  extends: 'foam.ui.View',

  properties: [
    {
      name:  'model'
    },
    {
      name:  'data',
      label: 'New Object',
      view: 'foam.ui.DetailView',
      factory: function() { return this.model.create(); }
    },
    {
      name:  'dao',
      label: 'DAO',
    }
  ],

  actions: [
    {
      name:  'save',
      label: 'Create',
      help:  'Create a new record.',

      code: function() {
        var self = this;
        this.dao.put(this.data, {
          put: function(value) {
            console.log("Created: ", value);
            self.X.stack.back();
          },
          error: function() {
            console.error("Error creating value: ", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel creation.',

      code: function() { this.X.stack.back(); }
    },
    {
      name:  'help',
      help:  'View help.',

      code: function() {
        var model = this.data.model_;
        var helpView = this.X.HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* $$data */}
  ]
});
