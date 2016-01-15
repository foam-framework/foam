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

  imports: [
    'dynamic',
    'maxLOD',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE-PREVIEW' ],
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
        display: this.dynamic(function(imageData) {
          return imageData ? 'block' : 'none';
        }, this.imageData$),
        transition: this.dynamic(function(currentImage) {
          return currentImage ? 'opacity 2000ms ease' : 'none';
        }, this.currentImage$),
        opacity: this.dynamic(function(imageData) {
          // TODO(markdittmer): It would be better if we could force opacity
          // change one frame after setting the transition, but U2 has no API
          // for this pattern. Setting offsetLeft "forces layout" with the
          // transition enabled/disabled.
          if ( this.el() ) this.el().offsetLeft = this.el().offsetLeft;
          return imageData ? '1' : '0';
        }.bind(this), this.imageData$),
      }).end();
    },
    function predicate() {
      return AND(this.SUPER(), LTE(this.DynamicImage.LEVEL_OF_DETAIL, this.maxLOD));
    }
  ],
});
