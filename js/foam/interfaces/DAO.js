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

__DATA({
  model_: 'Interface',
  name: 'DAO',
  package: 'foam.interfaces',
  description: 'Data Access Object',
  extends: ['Sink'],

  methods: [
    {
      name: 'find',
      description: 'Find a single object, using either a Predicate or the primary-key.',
      args: [
        { name: 'key', type: 'foam.interfaces.Predicate|Object' },
        { name: 'sink', type: 'foam.interfaces.Sink' }
      ]
    },
    {
      name: 'removeAll',
      description: 'Remove all (scoped) objects.',
      args: [
        { name: 'sink', type: 'foam.interfaces.Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'select',
      description: 'Select all (scoped) objects.',
      args: [
        { name: 'sink', type: 'foam.interfaces.Sink', optional: true, help: 'Defaults to [].' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'pipe',
      description: 'The equivalent of doing a select() followed by a listen().',
      args: [
        { name: 'sink', type: 'foam.interfaces.Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'listen',
      description: 'Listen for future (scoped) updates to the DAO.',
      args: [
        { name: 'sink', type: 'foam.interfaces.Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'unlisten',
      description: 'Remove a previously registered listener.',
      args: [
        { name: 'sink', type: 'foam.interfaces.Sink' }
      ]
    },
    {
      name: 'where',
      description: 'Return a DAO that will be filtered to the specified predicate.',
      returnValue: 'DAO',
      args: [
        { name: 'query', type: 'foam.interfaces.Predicate' }
      ]
    },
    {
      name: 'limit',
      description: 'Return a DAO that will limit future select()\'s to the specified number of results.',
      returnValue: 'DAO',
      args: [
        { name: 'count', type: 'Int' }
      ]
    },
    {
      name: 'skip',
      description: 'Return a DAO that will skip the specified number of objects from future select()\'s',
      returnValue: 'DAO',
      args: [
        { name: 'skip', type: 'Int' }
      ]
    },
    {
      name: 'orderBy',
      description: 'Return a DAO that will order future selection()\'s by the specified sort order.',
      returnValue: 'DAO',
      args: [
        {
          name: 'comparators',
          rest: true,
          type: 'foam.interfaces.Comparator',
          description: 'One or more comparators that specify the sort-order.'
        }
      ]
    }
    // Future: drop() - drop/remove the DAO
    //         cmd()  - handle extension operations
  ]
});
