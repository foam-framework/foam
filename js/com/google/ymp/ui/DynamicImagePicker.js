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
  name: 'DynamicImagePicker',
  extends: 'com.google.ymp.ui.DynamicImageView',

  requires: [
    'com.google.ymp.DynamicImage',
    'foam.ui.md.ImagePickerView',
  ],
  imports: [
    'dynamicImageDAO',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      help: 'The new image ID',
    },
    {
      name: 'image',
      lazyFactory: function() {
        return this.DynamicImage.create({
          id: createGUID(),
          imageID: createGUID()+"img",
          levelOfDetail: 8,
        });
      },
      postSet: function(old, nu) {
        console.log("image set:", old, "to", nu);
      }
    },
    {
      name: 'imageData',
      postSet: function(old, nu) {
        if ( nu && this.image.imageData !== nu ) {
          this.image.image = nu;
          this.dynamicImageDAO.put(this.image);
          this.data = this.image.imageID;
          //console.log("dynamicImageDAO", this.image.imageID, this.data);
        }
      }
    },
  ],

  methods: [
    function initE() {
      this.add(
        this.ImagePickerView.create({
          data$: this.imageData$,
          useCamera: true,
          hintText: "Tap to take Photo",
        })
      ).end();
    },
  ],

});
