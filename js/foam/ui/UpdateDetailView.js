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
  package: 'foam.ui',
  name: 'UpdateDetailView',
  extends: 'foam.ui.DetailView',

  imports: [
    'DAO as dao',
    'stack'
  ],

  properties: [
    {
      name: 'rawData',
      documentation: 'The uncloned original input data.',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.rawUpdate);
        if ( nu ) nu.addListener(this.rawUpdate);
      }
    },
    {
      name: 'originalData',
      documentation: 'A clone of the input data, for comparison with edits.'
    },
    {
      name: 'data',
      preSet: function(_, v) {
        if ( ! v ) return;
        this.rawData = v;
        return v.deepClone();
      },
      postSet: function(_, data) {
        if ( ! data ) return;
        this.originalData = data.deepClone();
        if ( data && data.model_ ) this.model = data.model_;
        var self = this;
        data.addPropertyListener(null, function(o, topic) {
          var prop = o.model_.getProperty(topic[1]);
          if ( prop.transient ) return;
          self.version++;
          self.rawData = '';
        });
      }
    },
    {
      name: 'view'
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      type: 'Int',
      name: 'version'
    }
  ],

  listeners: [
    {
      name: 'rawUpdate',
      code: function() {
        // If this listener fires, the raw data updated and the user hasn't
        // changed anything.
        this.data = this.rawData;
      }
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      code: function() {
        var self = this;
        var obj  = this.data;
        this.stack.back();

        this.dao.put(obj, {
          put: function() {
            console.log('Saving: ', obj.toJSON());
            self.originalData.copyFrom(obj);
          },
          error: function() {
            console.error('Error saving', arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      code: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isAvailable: function() { this.version; return this.originalData.equals(this.data); },
      code: function() { this.stack.back(); }
    },
    {
      name: 'reset',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      code: function() { this.data.copyFrom(this.originalData); }
    }
  ]
});
