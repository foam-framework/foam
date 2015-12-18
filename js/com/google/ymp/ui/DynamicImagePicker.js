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
      lazyFactory: function() {
        
      }
    },
  ],

  methods: [
    function initE() {
      this.add(this.ImagePickerView.create({ data$: this.data.imageData$ })).end();
    },
  ],
  
});
