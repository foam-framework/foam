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
  name: 'CreateView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.View',
  requires: [
    'foam.ui.DetailView',
  ],
  imports: [
    'dao',
    'overlay'
  ],

  properties: [
    {
      name: 'model',
      required: true
    },
    {
      name: 'label',
      defaultValueFn: function() { return 'Create a new ' + this.model.label; }
    },
    {
      name: 'innerView',
      factory: function() {
        return this.DetailView.create({
          model: this.model,
          data: this.model.create()
        });
      }
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Create',
      // TODO(braden): Make this toggle enabled based on required fields and
      // form validation.
      code: function() {
        this.dao.put(this.innerView.data, {
          put: function(x) {
            this.overlay.close();
          }.bind(this)
        });
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      %%innerView
      $$done
    */}
  ]
});
