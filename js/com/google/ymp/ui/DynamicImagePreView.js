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
  name: 'DynamicImagePreView',
  extends: 'com.google.ymp.ui.DynamicImageView',

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE-PREVIEW' ],
    {
      name: 'data',
      postSet: function(old,nu) {
        // look up the image id to find the best quality available
        var self = this;
        self.dynamicImageDAO
          .where(AND(EQ(self.DynamicImage.IMAGE_ID, nu), LTE(self.DynamicImage.LEVEL_OF_DETAIL, self.maxLOD)))
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
      type: 'Int',
      name: 'maxLOD',
      help: 'The highest level of detail required for this preview.',
      attribute: true,
      defaultValue: 128,
    }
  ],

  methods: [
    function initE() {
      this.start('img').attrs({
        src: this.imageData$
      }).style({
        width: function() {
          return this.width >= 0 ? this.width + 'px' : 'initial';
        }.bind(this),
      }).end();
    },
  ],
});
