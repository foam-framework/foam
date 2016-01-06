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

  imports: [ 'maxLOD' ],

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
        display: this.X.dynamic(function(imageData) {
          return imageData ? 'block' : 'none';
        }, this.imageData$)
      }).end();
    },
    function predicate() {
      return AND(this.SUPER(), LTE(this.DynamicImage.LEVEL_OF_DETAIL, this.maxLOD));
    }
  ],
});
