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
  package: 'foam.graphics',
  name:  'Label2',
  extendsModel: 'foam.graphics.CView',

  properties: [
    {
      name:  'text',
      defaultValue: ''
    },
    {
      name:  'align',
      label: 'Alignment',
      defaultValue: 'start' // values: left, right, center, start, end
    },
    {
      name:  'font',
      defaultValue: ''
    },
    {
      model_: 'ColorProperty',
      name:  'color',
      defaultValue: 'black'
    },
    {
      model_: 'ColorProperty',
      name: 'border',
      label: 'Border Color'
    },
    {
      model_: 'FloatProperty',
      name:  'maxWidth',
      label: 'Maximum Width',
      defaultValue: -1
    }
  ],

  methods: {
    paintSelf: function() {
      var c = this.canvas;
      if ( ! c ) return;

      c.globalAlpha = this.alpha;
      this.erase();

      if ( this.font ) c.font = this.font;
      c.textAlign = this.align;
      c.fillStyle = this.color;
      if ( this.align === 'center' ) {
        c.fillText(this.text, this.width/2, this.height/2+10);
      } else {
        c.fillText(this.text, 0, this.height/2+10);
      }

      if ( this.border ) {
        c.strokeStyle = this.border;
        c.strokeRect(0, 0, this.width-1, this.height-1);
      }
    }
  }
});
