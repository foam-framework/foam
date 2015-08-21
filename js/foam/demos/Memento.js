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
  name: 'Memento',
  traits: [
    'foam.memento.MemorableTrait'
  ],

  requires: [
    'foam.demos.MemorableObject',
    'foam.demos.SubMemorableObject',
    'foam.memento.FragmentMementoMgr',
    'foam.memento.FalseOnlyMemorableLatch',
    'foam.ui.JSView',
    'foam.ui.StringArrayView'
  ],

  properties: [
    {
      name: 'object',
      memorable: true,
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.MemorableObject.create({
          view: 'tree',
          subProperty: this.SubMemorableObject.create({
            title: 'hello',
            mode: 'read-write',
            zoomLevel: 0.543
          })
        });
      }
    },
    {
      name: 'falseOnlyLatch',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.FalseOnlyMemorableLatch.create();
      },
      memorable: true
    },
    {
      name: 'memento',
      view: 'foam.ui.JSView',
      hidden: false
    },
    {
      name: 'mementoMgr',
      hidden: true,
      factory: function() {
        return this.FragmentMementoMgr.create({ mementoValue: this.memento$ });
      }
    }
  ]
});
