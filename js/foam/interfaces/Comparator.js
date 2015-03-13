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
  name: 'Comparator',
  package: 'foam.interfaces',
  description: 'A strategy for comparing pairs of Objects.',

  methods: [
    {
      name: 'compare',
      description: 'Compare two objects, returning 0 if they are equal, > 0 if the first is larger, and < 0 if the second is.',
      returnType: 'Int',
      args: [
        { name: 'o1', description: 'The first object to be compared.' },
        { name: 'o2', description: 'The second object to be compared.' }
      ]
    },
  ]
});
