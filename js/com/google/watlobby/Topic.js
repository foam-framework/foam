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
  package: 'com.google.watlobby',
  name: 'Topic',

  traits: [ 'com.google.misc.Colors' ],

  properties: [
    {
      name: 'topic',
      postSet: function(_, t) {
        // Assign a random but consistent colour if not set
        if ( ! this.hasOwnProperty('color' ) )
          this.color = this.COLORS[Math.abs(t.hashCode()) % this.COLORS.length];
      }
    },
    { model_: 'BooleanProperty', name: 'selected' },
    { name: 'image' },
    {
      name: 'color',
      // Convert capitalized colour names to standard Google colours
      preSet: function(_, c) { return this[c] || c; }
    },
    { name: 'background' },
    { name: 'r' },
    { name: 'model', defaultValue: 'Topic' },
    { name: 'roundImage' },
    { name: 'video' },
    { name: 'text' },
    { name: 'timeout', defaultValue: 60, units: 'seconds' }
  ]
});
