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
  name: 'GestureTarget',
  package: 'foam.input.touch',
  help: 'Created by each view that wants to receive gestures.',
  properties: [
    { name: 'id' },
    {
      name: 'gesture',
      help: 'The name of the gesture to be tracked.'
    },
    {
      name: 'containerID',
      help: 'The containing DOM node\'s ID. Used for checking what inputs are within which gesture targets.'
    },
    {
      type: 'Boolean',
      name: 'enforceContainment',
      help: 'Require that the start and end of a matching gesture be inside the container.',
      defaultValue: false
    },
    {
      name: 'getElement',
      help: 'Function to retrieve the element this gesture is attached to. Defaults to $(containerID).',
      defaultValue: function() { return this.X.$(this.containerID); }
    },
    {
      name: 'handler',
      help: 'The target for the gesture\'s events, after it has been recognized.'
    }
  ]
});

