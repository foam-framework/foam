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
  package: 'foam.demos',
  name: 'ContainerManagedPersistence',

  requires: [
    'foam.persistence.DataUpdateSinker',
    'foam.ui.DetailView'
  ],
  imports: ['setTimeout'],
  properties: [
    {
      name: 'context',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.DataUpdateSinker.create();
      }
    },
    {
      name: 'settings',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.Preferences.create({
          receiveEmails: false,
          name: 'adam'
        })
      },
      postSet: function(_, data) {
        this.context.sink = this.put;
        this.context.data = data;
      }
    }
  ],
  listeners: [
    {
      name: 'put',
      code: function(obj, sink) {
        obj = obj.deepClone();
        this.setTimeout(function() {
          obj.version += 1;
          sink.put(obj);
        }, 200);
      }
    }
  ],
  models: [
    {
      name: 'Preferences',
      properties: [
        {
          type: 'Int',
          name: 'version',
          mode: 'read-only',
          defaultValue: 0
        },
        {
          type: 'Boolean',
          name: 'receiveEmails',
        },
        {
          type: 'String',
          name: 'name'
        },
        {
          model_: 'foam.core.types.StringEnumProperty',
          name: 'type',
          choices: [
            'A',
            'B',
            'C'
          ],
          defaultValue: 'A'
        }
      ]
    }
  ]
});
