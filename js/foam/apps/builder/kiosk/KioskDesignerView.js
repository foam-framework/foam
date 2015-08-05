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
  package: 'foam.apps.builder.kiosk',
  name: 'KioskDesignerView',
  extendsModel: 'foam.ui.View',
  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.ExportManager',
    'foam.apps.builder.kiosk.KioskAppConfigDetailView',
    'foam.apps.builder.kiosk.KioskView',
    'foam.apps.builder.Panel',
  ],

  imports: [
    'exportManager$',
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
    {
      type: 'foam.apps.builder.ExportManager',
      name: 'exportManager',
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{
          model_: 'foam.apps.builder.Panel',
          innerView: 'foam.apps.builder.kiosk.KioskAppConfigDetailView',
        }
        $$data{ model_: 'foam.apps.builder.kiosk.KioskView' }
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
