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
    'com.google.ymp.ui.DynamicImageLoader',
  ],
  imports: [
//    'data',
    'dynamicImageDAO',
  ],
  exports: [
    'as data',
  ],

  properties: [
    [ 'nodeName', 'DYNAMIC-IMAGE' ],
    {
      name: 'data',
      postSet: function(old, nu) {
        this.DynamicImageLoader.create({ data: nu }).get(function(imageData) {
          this.imageData = imageData;
        }.bind(this));
      },
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
      }).end();
    },
  ],
});
