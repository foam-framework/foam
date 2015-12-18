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
  package: 'com.google.ymp.ui',
  name: 'DynamicImageView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.DynamicImage',
  ],
  imports: [
    'dynamicImageDAO',
    'highResImageDAO'
  ],
  exports: [
    'as data',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      postSet: function(old,nu) {
        // look up the image id to find the best quality available
        var self = this;
        self.dynamicImageDAO
          .where(EQ(self.DynamicImage.IMAGE_ID, nu))
          .orderBy(DESC(self.DynamicImage.LEVEL_OF_DETAIL))
          .limit(1)
          .pipe({
            put: function(img) {
              self.currentImage = img;
            }
          });
      }
    },
    {
      name: 'currentImage',
      preSet: function(old, nu) {
        if ( ! old || ( nu && nu.levelOfDetail > old.levelOfDetail ) ) {
          return nu;
        }
        return old;
      },
      postSet: function(old,nu) {
        this.imageData = nu.image;
      }
    },
    {
      type: 'Image',
      name: 'imageData',
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: -1,
      attribute: true,
      postSet: function(old, nu, prop) { console.log(this.model_.id, this.id, prop.name, old, nu); },
    },
  ],

  methods: [
    function initE() {
      this.start('img').attrs({
        src: this.imageData$
      }).style({
        width: function() {
          return this.width >= 0 ? this.width + 'px' : 'initial';
        }.bind(this),
      }).on('click', this.clickZoom).end();
    },
  ],
  
  listeners: [
    function clickZoom() {
      var self = this;
      // select only images that are better quality than our current, select directly into image cache
      var pred = ( self.currentImage ) ? 
        GT(self.DynamicImage.LEVEL_OF_DETAIL, self.currentImage.levelOfDetail)
        : TRUE;
      self.highResImageDAO
        .where(AND(EQ(self.DynamicImage.IMAGE_ID, self.data), pred))
        .orderBy(DESC(self.DynamicImage.LEVEL_OF_DETAIL))
        .limit(1)
        .select(self.dynamicImageDAO);
    }
  ]
});
