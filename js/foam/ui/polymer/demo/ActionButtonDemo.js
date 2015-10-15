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
  name: 'ActionButtonDemo',
  package: 'foam.ui.polymer.demo',
  extends: 'foam.ui.View',
  requires: [
    'Action',
    'foam.ui.polymer.ActionButton',
    'foam.ui.polymer.demo.ActionState'
  ],
  imports: ['log'],

  properties: [
    {
      type: 'foam.ui.polymer.demo.ActionState',
      name: 'data',
      view: 'foam.ui.polymer.ActionButton',
      factory: function() { return {}; }
    },
    {
      type: 'Action',
      name: 'mainAction',
      factory: function() {
        return this.Action.create({
          label: 'Main Action',
          code: function() {
            this.log('Main action committed');
          }.bind(this),
          isAvailable: function() {
            return this.available;
          },
          isEnabled: function() {
            return this.enabled;
          }
        });
      }
    },
    {
      type: 'Action',
      name: 'toggleAvailable',
      factory: function() {
        return this.Action.create({
          label: 'Toggle Available',
          help: 'Make the "Main Action" button appear or disappear',
          code: function() {
            this.available = !this.available;
          }
        });
      }
    },
    {
      type: 'Action',
      name: 'toggleEnabled',
      factory: function() {
        return this.Action.create({
          label: 'Toggle Enabled',
          help: 'Enable or disable the "Main Action" button',
          code: function() {
            this.enabled = !this.enabled;
          }
        });
      }
    },
    {
      type: 'foam.ui.polymer.demo.ActionState',
      name: 'raised',
      view: { model_: 'foam.ui.polymer.ActionButton', raised: true },
      factory: function() { return {}; }
    },
    {
      type: 'Action',
      name: 'raisedAction',
      factory: function() {
        return this.Action.create({
          label: 'Raised',
          code: function() {
            this.log('Raised action committed');
          }.bind(this)
        });
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div>
        $$raised{ action: this.raisedAction }
      </div><div>
        $$data{ action: this.toggleAvailable }
        $$data{ action: this.toggleEnabled }
        $$data{ action: this.mainAction }
      </div>
    */}
  ]
});
