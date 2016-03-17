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
  package: 'foam.persistence',
  name: 'ManualObjectReplicator',
  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'model',
      hidden: true
    },
    {
      name: 'dao',
      hidden: true
    },
    {
      name: 'future',
      hidden: true,
      lazyFactory: function() {
        return afuture();
      }
    },
    {
      name: 'obj',
      hidden: true,
      postSet: function(old, nu) {
        this.future.set(nu);
      }
    },
    {
      name: 'feedback',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'saving',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'lastError',
      type: 'Boolean',
      defaultValue: false
    }
  ],
  methods: [
    {
      name: 'start',
      code: function() {
        this.dao.find(this.id, {
          put: function(obj) {
            this.obj = obj.deepClone();
          }.bind(this)
        });

        this.dao.where(EQ(this.model.ID, this.id)).listen({
          put: function(obj) {
            if ( ! this.obj ) {
              this.obj = obj.deepClone();
            } else {
              this.feedback = true;
              this.obj.copyFrom(obj);
              this.feedback = false;
            }
          }.bind(this)
        });
      }
    }
  ],
  actions: [
    {
      name: 'save',
      isEnabled: function() {
        var saving = this.saving;
        var obj = this.obj;
        return obj && ! saving;
      },
      code: function() {
        this.lastError = false;
        this.saving = true;
        this.dao.put(this.obj.clone(), {
          put: function() {
            this.lastError = false;
            this.saving = false;
          }.bind(this),
          error: function() {
            this.lastError = true;
            this.saving = false;
          }.bind(this)
        });
      }
    }
  ]
});
