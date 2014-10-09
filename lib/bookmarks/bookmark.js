/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'Bookmark',

  tableProperties: [
    'icon',
    'title',
    'url'
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name:  'icon',
      getter: function() {
        var i = this.url ? this.url.lastIndexOf('/') : -1;
        var img = i == -1 ? 'download.png' : this.url.substr(i+1);

        if ( img == '' ) img = 'undefined';

        return "<img src='images/16/" + img + ".png'/>";
      }
      //     getter: function() { return "<img src='chrome://favicon/size/16/" + this.url}
    },
    {
      name:  'title',
      help:  "Bookmarked page's title.",
      displayWidth: 40
    },
    {
      model_: 'URLProperty',
      name:  'url',
      label: 'URL',
      help:  "Bookmarked page's URL.",
      displayWidth: 40
    }
  ],

  actions: [
    {
      model_: 'Action',
      name:  'visit',
      help:  'Visit Bookmark.',

      action: function()      {
        window.location = this.url;
        /*
          chrome.send('navigateToUrl', [
          this.url,
          "el.target",
          0, //e.button,
          null, //e.altKey,
          null, //e.ctrlKey,
          null, //e.metaKey,
          null, //e.shiftKey
          ]);
        */
        //'chrome://favicon/size/16/' + this.data.url;
      }
    }
  ],

  methods: {
  }
});


MODEL({
  name: 'AddBookmarkDialog',

  extendsModel: 'DetailView',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao'
    }
  ],

  actions: [
    {
      name: 'add',
      help: 'Add Bookmark (Ctrl-A)',
      isEnabled: function() { return this.data.title; },
      action: function () {
        this.$.remove();
        this.dao.put(this.data);
      }
    },
    {
      name: 'cancel',
      help: 'Cancel (Ctrl-C)',
      action: function () { this.$.remove(); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.titleView.focus();
    }
  },

  templates: [
    function toHTML() {/*
      <div id="%%id" class="LinkDialog" style="position:absolute">
        <table><tr>
        <th>Text</th><td>$$title{onKeyMode: true}</td></tr><tr>
        <th>Link</th><td>$$url</td>
        <tr><td colspan=2 align=right>$$add $$cancel</td>
        </tr></table>
      </div>
    */}
  ]
});
