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
  name: 'Audio',
  package: 'foam.navigator.types',
  extends: 'foam.navigator.BasicFOAMlet',

  requires: [
    'foam.navigator.types.AudioSource',
    'foam.navigator.views.AudioView'
  ],

  properties: [
    {
      type: 'String',
      name: 'name',
      dynamicValue: function() {
        return [
          this.title,
          this.creator,
          this.collection
        ].filter(function(o) { return o; }).join(' - ');
      },
      required: true
    },
    {
      name: 'iconURL',
      defaultValue: 'images/audio.png',
      view: 'foam.ui.ImageView',
      todo: 'tableFormatter: This should be the view\'s concern',
      tableFormatter: function(iconURL, self) {
        debugger;
        return '<img src="' + iconURL + '"></img>';
      }
    },
    {
      type: 'String',
      name: 'title'
    },
    {
      type: 'String',
      name: 'creator'
    },
    {
      type: 'String',
      name: 'collection'
    },
    {
      name: 'audioData',
      label: 'Audio File',
      type: 'foam.navigator.types.AudioSource',
      preSet: function(old, nu) {
        if ( typeof nu === 'string' ) {
          return this.AudioSource.create({ src: nu });
        } else {
          return nu;
        }
      },
      view: 'foam.navigator.views.AudioView',
      todo: 'tableFormatter: This abuses view lifecycle',
      tableFormatter: function(audioData, self) {
        return self.AudioView.create({
          data: audioData
        }).toHTML();
      }
    }
  ]
});
