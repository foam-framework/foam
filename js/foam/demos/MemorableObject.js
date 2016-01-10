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
  name: 'MemorableObject',
  traits: ['foam.memento.MemorableTrait'],
  requires: [
    'foam.demos.MemorableQuery'
  ],
  properties: [
    {
      type: 'String',
      name: 'view',
      memorable: true
    },
    {
      name: 'subProperty',
      view: 'foam.ui.DetailView',
      memorable: true
    },
    {
      name: 'queryProperty',
      memorable: true,
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.MemorableQuery.create({
          queryParser: QueryParserFactory(this.model_)
        });
      }
    }
  ]
});
