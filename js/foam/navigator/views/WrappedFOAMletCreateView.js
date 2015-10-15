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
  name: 'WrappedFOAMletCreateView',
  package: 'foam.navigator.views',
  extends: 'foam.navigator.views.CreateView',

  requires: [ 'foam.navigator.WrappedFOAMlet' ], 
  
  documentation: function() {/* Replaces CreateView to enable to creation of a
    FOAMlet-wrapped object. 
  */},

  properties: [
    {
      name: 'label',
      defaultValueFn: function() { 
        if ( this.model && this.model.model && this.model.model.label ) { 
          return 'Create a new ' + this.model.model.label;
        } else {
          console.warn("Can't find WrappedFOAMlet model name!");
          return 'Create a new ' + this.model_.label + ' (name error!)';
        }
      }
    },
    {
      name: 'innerView',
      factory: function() {
        if ( this.model && this.model.model && this.model.model ) { 
          return this.DetailView.create({
              model: this.model.model,
              data: this.model.model.create()
          });
        } else {
          console.warn("Can't find WrappedFOAMlet model.model!", this);
        }
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
        this.dao.put(
          this.model.create({ data: this.innerView.data }),
          {
            put: function(x) {
              this.overlay.close();
            }.bind(this)
          }
        );
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
