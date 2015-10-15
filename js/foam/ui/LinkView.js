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
  name: 'LinkView',

  extends: 'foam.ui.DetailView',

  properties: [
    {
      name: 'insertButton',
      factory: function() {
        return ActionButton.create({
          action: Link.INSERT,
          data: this.data
        });
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.insertButton);
    },
    initHTML: function() {
      this.SUPER();
      this.$.addEventListener('keyup', this.keyUp);
      this.labelView.focus();
    },
    close: function() { this.$.remove(); }
  },

  listeners: [
    {
      name: 'keyUp',
      code: function(e) {
        if ( e.keyCode == 27 /* Esc */ ) {
          e.stopPropagation();
          this.close();
        }
      }
    }
  ],

  templates: [
    {
      name: "toHTML",
      template:
        '<div id="<%= this.id %>" class="linkDialog" style="position:absolute">\
        <table><tr>\
        <th>Text</th><td>$$label</td></tr><tr>\
        <th>Link</th><td>$$link\
        %%insertButton</td>\
        </tr></table>\
        </div>'
    }
  ]
});
