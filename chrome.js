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
var BookmarkModel = Model.create({

  name: 'Bookmark',

  tableProperties: [
    'icon',
    'title',
    'url'
  ],

  properties: [
    {
      name: 'index',
      type: 'int',
      defaultValue: 0,
      view: 'IntFieldView'
    },
    {
      name: 'icon',
      type: 'String',
      view: 'TextFieldView',
      getter: function() {
        var i = this.url ? this.url.lastIndexOf('/') : -1;
        var img = i == -1 ? 'download.png' : this.url.substr(i + 1);

        if (img == '') img = 'undefined';

        return "<img src='images/16/" + img + ".png'/>";
      }
      //     getter: function() {
      //       return "<img src='chrome://favicon/size/16/" + this.url
      //     }
    },
    {
      name: 'title',
      type: 'String',
      defaultValue: '',
      help: "Bookmarked page's title.",
      displayWidth: 60
    },
    {
      name: 'url',
      label: 'URL',
      type: 'URL',
      defaultValue: '',
      help: "Bookmarked page's URL.",
      displayWidth: 60
    }
  ],

  actions: [
    {
      model_: 'Action',
      name: 'visit',
      help: 'Visit Bookmark.',

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

var bookmarks = [];

/*
var ntp4 = {
   setBookmarksData: function(bookmarks) {
     for ( var i = 0 ; i < bookmarks.items.length ; i++ )
     {
        var bookmark = bookmarks.items[i];

        console.log("bookmarks.push(BookmarkModel.create({" +
          "index: " + bookmark.index +
          ", title: '" + bookmark.title + "'" +
          ", url: '" + bookmark.url + "'" + "}));");
        // bookmarks.push(BookmarkModel.create(bookmark));
     }
   }
};

if ( chrome && chrome.send ) chrome.send('getBookmarksData');
*/


bookmarks.push(BookmarkModel.getPrototype().create(
    {
      index: 1,
      title: 'Google Blog',
      url: 'http://googleblog.blogspot.com/2011/09/' +
          'happy-third-birthday-chrome.html'
    }));

var Bookmark = BookmarkModel.getPrototype();
