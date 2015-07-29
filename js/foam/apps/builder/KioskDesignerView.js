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
    'foam.apps.builder.ExportManager',
    'foam.apps.builder.KioskAppConfigDetailView',
    'foam.apps.builder.KioskView',
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

  methods: [
    function init() {
      this.SUPER();
      // The first designer view to appear on the scene should preload kiosk
      // sources in the exportManager.
      this.exportManager.config = this.data;
      this.exportManager.aloadSources();
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk-designer id="%%id" <%= this.cssClassAttr() %>>
        $$data{
          model_: 'foam.apps.builder.Panel',
          innerView: 'foam.apps.builder.KioskAppConfigDetailView',
        }
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
