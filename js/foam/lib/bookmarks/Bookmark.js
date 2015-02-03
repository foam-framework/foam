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
