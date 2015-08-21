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
  name: 'AudioSource',
  package: 'foam.navigator.types',
  extendsModel: 'foam.navigator.BasicFOAMlet',

  constants: [
    {
      name: 'TYPES',
      value: {
        mp3: 'audio/mpeg',
        mpeg: 'audio/mpeg',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
        m4a: 'audio/mpeg'
      }
    }
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'src',
      required: true
    },
    {
      model_: 'StringProperty',
      name: 'type',
      factory: function() {
        return this.TYPES[this.src.split('.').pop()] || 'audio/mpeg';
      },
      view: {
        factory_: 'ChoiceListView',
        choices: [
          'audio/mpeg',
          'audio/ogg',
          'audio/wav'
        ]
      }
    }
  ]
});
