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
    'uploadImageDAO',
    'document',
    'market',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      help: 'The new image ID',
    },
    {
      name: 'imageData',
      postSet: function(old, nu) {
        if ( nu && old !== nu ) {
          this.data = createGUID(); //this.image.imageID;
          this.mipMap(nu, this.data);
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
    function mipMap(nu, id) {
      /* Create multiple resolutions of the source image, put to dynamicImageDAO */

      var imageSpecs = new Image();

      imageSpecs.onload = function() {
        // full res
        this.uploadImageDAO.put(this.DynamicImage.create({
          id: createGUID(),
          imageID: id,
          levelOfDetail: 512,
          image: nu,
          width: imageSpecs.naturalWidth,
          height: imageSpecs.naturalHeight,
          market: this.market,
        }));
  console.log("MipMapping ", id);
        var resizeTo = function(mult) {
          var w = imageSpecs.naturalWidth * mult;
          var h = imageSpecs.naturalHeight * mult;
          var canvas = this.document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(imageSpecs, 0, 0, w, h);
          return canvas.toDataURL("image/jpeg");
        }.bind(this);

        var sizes = this.DynamicImage.getPrototype().LOD_LIST;
        var mult = 1.0;
        for (var i = 1; i < sizes.length; ++i) {
          for (var esc = 0; esc < 10; ++esc) { // loop until we've found the right size
            var newImage = resizeTo(mult);
            if ( newImage.length < (sizes[i] * 1024) ) { // compare actual size to LOD
              this.uploadImageDAO.put(this.DynamicImage.create({
                id: createGUID(),
                imageID: id,
                levelOfDetail: sizes[i],
                image: newImage,
                width: imageSpecs.naturalWidth * mult,
                height: imageSpecs.naturalHeight * mult,
                market: this.market,
              }));
  console.log("found Image", newImage.length, sizes[i], imageSpecs.naturalWidth * mult, imageSpecs.naturalHeight * mult);
              break;
            } else {
              mult *= 0.75; // shrink to 75% and try again
  console.log("trying again Image", newImage.length, sizes[i], mult);
            }
          }
        }
      }.bind(this);

      imageSpecs.src = nu;
    }
  ],

});
