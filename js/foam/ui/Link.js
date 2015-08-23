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
  package: 'foam.ui',
  name: 'Link',
  requires: [
    'foam.ui.LinkView'
  ],
  properties: [
    {
      name: 'richTextView'
    },
    {
      name: 'label',
      displayWidth: 28
    },
    {
      name: 'link',
      displayWidth: 19,
      view: { factory_: 'foam.ui.TextFieldView', placeholder: 'Type or paste link.' },
      preSet: function(_, value) {
        value = value.trim();
        // Disallow javascript URL's
        if ( value.toLowerCase().startsWith('javascript:') ) value = '';
        return value;
      }
    }
  ],
  methods: {
    open: function(x, y) {
      var view = this.LinkView.create({data: this});
      this.richTextView.$.parentNode.insertAdjacentHTML('beforebegin', view.toHTML());
      view.$.style.left = x + this.richTextView.$.offsetLeft;
      view.$.style.top = y + this.richTextView.$.offsetTop;
      view.initHTML();
      this.view = view;
    }
  },
  actions: [
    {
      name:  'insert',
      label: 'Apply',
      help:  'Insert this link into the document.',

      code: action() {
        var a   = document.createElement('a');
        var txt = document.createTextNode(this.label);
        a.href = this.link;
        a.appendChild(txt);

        this.richTextView.insertElement(a);

        this.view.close();
      }
    }
  ]
});
