/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'UpdateDetailView',
  extendsModel: 'foam.ui.DetailView',
  package: 'foam.ui',
  
  documentation:function() {/*
    Provides a detailview that allows user changes and puts them back to a DAO.
    TODO(jacksonic): This could easily be a trait as there is no DOM dependent code here.
  */},

  imports: ['DAO as dao'],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        // since we're cloning the propagated data, we have to listen
        // for changes to the data and clone again 
        if ( old ) old.removeListener(this.parentContentsChanged);
        if ( nu ) nu.addListener(this.parentContentsChanged);
        
        if (!nu) return;
        // propagate a clone and build children
        this.childDataValue.set(nu.deepClone());
        this.originalData = nu.deepClone();
  
        this.data.addListener(function() {
          // The user is making edits. Don't listen for parent changes,
          // since we no longer want to react to updates to it.
          this.version++;
          this.data.removeListener(this.parentContentsChanged);
        }.bind(this));
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the parent data, for comparison with edits.'
    },
    {
      name: 'dao'
    },
    {
      name: 'stack',
      defaultValueFn: function() { return this.X.stack; }
    },
    {
      name: 'view'
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      model_: 'IntProperty',
      name: 'version'
    }
  ],
  
  listeners: [
    {
      name: 'parentContentsChanged',
      code: function() {
        // If this listener fires, the parent data has changed internally
        // and the user hasn't edited our copy yet, so keep the clones updated.
        this.childDataValue.value.copyFrom(this.data);
        this.originalData.copyFrom(this.data);
      }
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() {
        var self = this;
        var obj  = this.data;
        this.stack.back();

        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());
            self.originalData.copyFrom(obj);
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.childDataValue.value); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isAvailable: function() { this.version; return this.originalData.equals(this.childDataValue.value); },
      action: function() { this.stack.back(); }
    },
    {
      name: 'reset',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.childDataValue.value); },
      action: function() { this.childDataValue.value.copyFrom(this.originalData); } // or do we want data?
    }
  ]
});
