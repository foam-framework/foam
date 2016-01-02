/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp.generators',
  name: 'DynamicImageGenerator',

  documentation: function() {/*
    Auto-generate images using Google Custom Search API over an image-oriented
    search engine.

    NOTE: NodeJS implementation is the only one that currently works (due to
    CORS).

    Batch generation via com.google.ymp.GenerateDynamicImages.execute().
  */},

  requires: [
    'foam.net.NodeHTTPRequest',
    'com.google.ymp.DynamicImage',
  ],
  imports: ['console'],

  properties: [
    {
      type: 'String',
      name: 'apiKey',
      defaultValue: 'AIzaSyBWapcWoWSOAEgzf0vHL4dRTMnma98jveA',
      documentation: 'API Key for Google Custom Search engine',
    },
    {
      type: 'String',
      name: 'searchId',
      defaultValue: '017970475687133860770:crlud8hsoge',
      documentation: 'Search Engine ID for Google Custom Search engine',
    },
    {
      type: 'Boolean',
      name: 'inBrowser_',
      lazyFactory: function() { return typeof vm == "undefined" || ! vm.runInThisContext; },
    },
  ],

  methods: [
    function generate(ret, q) {
      this.findImages(this.generate_.bind(this, ret, q), q);
    },
    function findImages(ret, q) {
      var url = 'https://www.googleapis.com/customsearch/v1?q=' +
          q + '+type:image&cx=' + this.searchId +
          '&key=' + this.apiKey;
      this.NodeHTTPRequest.create()
          .fromUrl(url)
          .asend()(function(response) {
            if ( response.status < 200 || response.status >= 300 ) throw response;
            var data = JSON.parse(response.payload);
            var imgs = [];
            data.items.forEach(function(item, i) {
              if ( item && item.pagemap && item.pagemap.cse_image &&
                  item.pagemap.cse_image[0] && item.pagemap.cse_image[0] ) {
                var fs = this.DynamicImage.create({
                  id: q + '_' + i + '_fs',
                  imageID: q + '_' + i,
                  image: item.pagemap.cse_image[0].src,
                  levelOfDetail: '256',
                });
                if ( item && item.pagemap && item.pagemap.metatags &&
                    item.pagemap.metatags[0] &&
                    item.pagemap.metatags[0]['twitter:image:width'] &&
                    item.pagemap.metatags[0]['twitter:image:width'] ) {
                  fs.width = item.pagemap.metatags[0]['twitter:image:width'];
                  fs.height = item.pagemap.metatags[0]['twitter:image:height'];
                }
                imgs.push(fs);
              }
              if ( item && item.pagemap && item.pagemap.cse_thumbnail &&
                  item.pagemap.cse_thumbnail[0] ) {
                var tn = this.DynamicImage.create({
                  id: q + '_' + i + '_tn',
                  imageID: q + '_' + i,
                  image: item.pagemap.cse_thumbnail[0].src,
                  width: item.pagemap.cse_thumbnail[0].width,
                  height: item.pagemap.cse_thumbnail[0].height,
                  levelOfDetail: '8',
                });
                imgs.push(tn);
              }
            }.bind(this));
            ret(imgs);
          }.bind(this));
    },
    function generate_(ret, q, images) {
      var ret = this.generate__.bind(this, ret, q);
      if ( this.inBrowser_ ) this.getImagesBrowser(ret, images);
      else                   this.getImagesNode(ret, images);
    },
    function getImagesBrowser(ret, imgs) {
      var window = this.X.window;
      var document = this.X.document;
      var f = function(img, ret) {
        var imgTag = document.createElement('img');
        imgTag.addEventListener('load', function() {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          context.drawImage(imgTag, 0, 0 );
          img.image = canvas.toDataURL();
          ret(img);
        });
        imgTag.src = img.image;
      };
      apar.apply(null, imgs.map(function(img) { return f.bind(this, img); }.bind(this)))(ret);
    },
    function getImagesNode(ret, imgs) {
      var f = function(img, ret) {
        this.NodeHTTPRequest.create()
            .fromUrl(img.image)
            .asend({}, {
              responseType: 'text',
              encoding: 'base64',
            })(function(response) {
              if ( response.status < 200 || response.status >= 300 ) throw response;
              var contentType = response.headers['content-type'] || 'image/png';
              img.image = 'data:' + contentType + ';base64,' + response.payload;
              ret(imgs);
            }.bind(this), img.image);
      };
      apar.apply(null, imgs.map(function(img) { return f.bind(this, img); }.bind(this)))(ret);
    },
    function generate__(ret, q, imgs) {
      ret(imgs);
    },
    function str2ab(str) {
      var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
      for ( var i = 0, strLen = str.length; i < strLen; i++ ) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    },
  ],
});
