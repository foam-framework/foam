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
  package: 'foam.apps.builder',
  name: 'KioskDesignerView',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.apps.builder.Panel',
    'foam.apps.builder.KioskView',
  ],

  exports: [
    'url$',
  ],

  constants: {
    AUX_DATA_PROPS: [
      'config',
      'chrome',
    ],
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.homepage$, this.url$);
        if ( nu ) Events.follow(nu.homepage$, this.url$);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{ model_: 'foam.apps.builder.Panel' }
        $$data{ model_: 'foam.apps.builder.KioskView' }
      </kiosk-designer>
    */},
    function CSS() {/*
      kiosk-designer { 
        position: relative;
        display: flex; 
        flex-grow: 1;
      }
      kiosk-designer panel { z-index: 2; }
      kiosk-designer kiosk { z-index: 1; }
    */},
  ],
});
