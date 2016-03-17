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
  name: 'CompositeObjectReplicator',
  properties: [
    {
      name: 'saving',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'lastError',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'children',
      postSet: function(_, c) {
        for ( var i = 0 ; i < c.length ; i++ ) {
          c[i].addListener(this.onChildUpdate);
        }
      }
    }
  ],
  listeners: [
    {
      name: 'onChildUpdate',
      isMerged: 1,
      code: function() {
        var saving = false;
        var error = false;
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          saving = this.children[i].saving || saving;
          error = this.children[i].lastError || error;
        }
        this.saving = saving;
        this.lastError = error;
      }
    }
  ],
  actions: [
    {
      name: 'save',
      isEnabled: function() {
        var children = this.children;
        var saving = false;
        for ( var i = 0 ; i < children.lenth ; i++ ) {
          saving = children[i].saving || saving;
        }
        return ! saving;
      },
      code: function() {
        this.lastError = false;
        this.saving = true;
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          this.children[i].save();
        }
      }
    }
  ]
});
