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
    'highResImageDAO',
    'dynamicImageDataDAO',
  ],
  exports: [
    'as data',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      postSet: function(old, nu) {
        // look up the image id to find the best quality available
        var self = this;
        if ( old !== nu ) self.clearCurrentImage();
        self.dynamicImageDAO
          .where(self.predicate())
          .orderBy(DESC(self.DynamicImage.LEVEL_OF_DETAIL))
          .limit(1)
          .pipe({
            put: function(img) {
              self.setCurrentImage(img);
            }.bind(this)
          });
      }
    },
    {
      name: 'currentImage',
      postSet: function(old, nu) {
        if ( ! nu ) {
          this.imageData = '';
          return;
        }

        if ( old !== nu ) {
          this.dynamicImageDataDAO.find(nu.id, {
            put: function(imgD) {
              this.imageData = imgD.image;
            }.bind(this)
          });
        }
      },
      defaultValue: null,
    },
    {
      type: 'Image',
      name: 'imageData',
    },
    {
      type: 'String',
      name: 'width',
      defaultValue: "",
      attribute: true,
      adapt: function(old, nu, prop) {
        if ( typeof nu !== 'string' ) {
          return nu+"px";
        }
        return nu;
      },
    },
    {
      type: 'Boolean',
      name: 'isClickable',
      attribute: true,
      defaultValue: true
    }
  ],

  methods: [
    function initE() {
      this.start('img').attrs({
        src: this.imageData$
      }).style({
        'min-width': this.width$,
        'max-width': this.width$,
        transition: this.dynamic(function(currentImage) {
          return currentImage ? 'opacity 250ms ease' : 'none';
        }, this.currentImage$),
        opacity: this.dynamic(function(imageData) {
          return imageData ? '1' : '0';
        }, this.imageData$),
      }).on('click', this.clickZoom).end();
    },
    function predicate() { return EQ(this.DynamicImage.IMAGE_ID, this.data); },
    function clearCurrentImage() {
      this.currentImage = null;
    },
    function setCurrentImage(newImage) {
      var old = this.currentImage, nu = newImage;
      if ( ! old || (nu && nu.levelOfDetail > old.levelOfDetail) ) {
        this.currentImage = newImage;
      }
    },
  ],

  listeners: [
    function clickZoom() {
      if ( ! this.isClickable ) return false;

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
    },
  ]
});
