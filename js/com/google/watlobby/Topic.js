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
    {
      model_: 'BooleanProperty',
      name: 'enabled',
      defaultValue: true
    },
    {
      name: 'priority',
      defaultValue: 3,
      view: {
        factory_: 'foam.ui.md.ChoiceRadioView',
        choices: [
          [ 1, 'Low' ],
//          [ 2, '' ],
          [ 3, 'Medium' ],
//          [ 4, '' ],
          [ 5, 'High' ]
        ]
      },
      postSet: function(_, p) {
        this.r = ([110, 130, 150, 180, 200])[p-1];
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'selected',
      hidden: true
    },
    {
      model_: 'ImageProperty',
      name: 'image'
    },
    {
      model_: 'BooleanProperty',
      name: 'roundImage'
    },
    {
      model_: 'ColorProperty',
      name: 'background',
      defaultValue: '#FFFFFF',
      view: { factory_: 'foam.ui.md.ColorFieldView', choices: [ '#FFFFFF', '#EA4335', '#34A853', '#4285F4', '#FBBC05' ] }
    },
    {
      model_: 'ColorProperty',
      name: 'color',
      // Convert capitalized colour names to standard Google colours
      preSet: function(_, c) { return this[c] || c; },
      view: { factory_: 'foam.ui.md.ColorFieldView', choices: [ '#FFFFFF', '#EA4335', '#34A853', '#4285F4', '#FBBC05' ] }
    },
    {
      name: 'r',
      hidden: true
    },
    {
      model_: 'IntProperty',
      name: 'timeout',
      defaultValue: 60,
      help: 'Time before automatically closing this topic, in seconds.',
      units: 'seconds'
    },
    {
      name: 'model',
      defaultValue: 'Topic',
      view: {
///        factory_: 'foam.ui.md.ChoiceMenuView',
        factory_: 'foam.ui.md.ChoiceRadioView',
        choices: [ 'Album', 'Topic', 'Video' ]
      }
    },
    {
      name: 'video',
      help: 'YouTube URL',
      preSet: function(_, v) { return v.substring(v.lastIndexOf('=')+1); }
    },
    {
      model_: 'StringProperty',
      name: 'text',
      displayHeight: 12
    },
  ]
});
