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
  name: 'Sink',
  package: 'foam.interfaces',
  description: 'Data Sink',

  documentation: function() {/*
    <p>The $$DOC{ref:'Sink'} $$DOC{ref:'Interface'} forms the basis for all data
    access. At a minimum, data stores must support the
    $$DOC{ref:'.put'} and $$DOC{ref:'.remove'} operations.</p>
  */},

  methods: [
    {
      name: 'put',
      description: 'Put (add) an object to the Sink.',
      documentation: "<p>Adds the given object to the store.<p>",
      args: [
        { name: 'obj', type: 'Object', documentation: 'The object to add.' },
        { name: 'sink', type: 'foam.interfaces.Sink', documentation: '<p>The next sink to chain: sink.put(obj) is called after this.put() completes.</p>' }
      ]
    },
    {
      name: 'remove',
      description: 'Remove a single object.',
      documentation: "Removes the given object from the store.",
      args: [
        { name: 'obj', type: 'Object', documentation: 'The object to remove.' },
        { name: 'sink', type: 'foam.interfaces.Sink', documentation: '<p>The next sink to chain: sink.remove(obj) is called after this.remove() completes.</p>' }
      ]
    },
    {
      name: 'error',
      description: 'Report an error.',
      documentation: "<p>Report an error to the $$DOC{ref:'Sink'}.</p>",
      args: [
        { name: 'obj', type: 'Object' }
      ]
    },
    {
      name: 'eof',
      description: 'Indicate that no more operations will be performed on the Sink.',
      documentation: "<p>Indicates that no more operations will be performed on the $$DOC{ref:'Sink'}.</p>"
    }
  ]
});
