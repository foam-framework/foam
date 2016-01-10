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
  name: 'Bookmark',
  package: 'foam.lib.bookmarks',

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
      type: 'URL',
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

      code: function()      {
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
