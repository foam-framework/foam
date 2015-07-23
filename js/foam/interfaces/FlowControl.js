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
  name: 'FlowControl',
  package: 'foam.interfaces',
  description: 'DAO FLow Control.  Used to control select() behavior.',

  methods: [
    {
      name: 'stop'
    },
    {
      name: 'error',
      args: [
        { name: 'e', type: 'Object' }
      ]
    },
    {
      name: 'isStopped',
      description: 'Returns true iff this selection has been stopped.',
      returnType: 'Boolean'
    },
    {
      name: 'getError',
      description: 'Returns error passed to error(), or undefined if error() never called',
      returnType: 'Object'
    }
    /*
    // For future use.
    {
    name: 'advance',
    description: 'Advance selection to the specified key.',
    args: [
    { name: 'key', type: 'Object' },
    { name: 'inclusive', type: 'Object', optional: true, defaultValue: true },

    ]
    }*/
  ]
});
