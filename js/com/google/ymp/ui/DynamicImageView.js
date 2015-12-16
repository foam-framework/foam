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
    'com.google.ymp.'
  ],
  imports: [
    'data',
    'dynamicImageDAO',
  ],

  properties: [ 
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      postSet: function(old,nu) {
        // look up the image id to find the best quality available
        var self = this;
        self.dynamicImageDAO = this.X.dynamicImageDAO;
        self.dynamicImageDAO
          .where(EQ(self.DynamicImage.IMAGE_ID, nu))
          .orderBy(self.DynamicImage.LEVEL_OF_DETAIL)
          .limit(1)
          .select({
            put: function(img) {
              self.imageData = img.image;
            }
          });
      }
    },
    {
      type: 'Image',
      name: 'imageData',
    }
  ],

  templates: [
    function initE() {/*#U2
      <div class="$"><:imageData /></div>
    */},
    function CSS() {/*
      $ {
        
      }
    */}
  ]
});
