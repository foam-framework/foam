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
  name: 'KioskView',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.apps.builder.KioskChromeView',
    'foam.apps.builder.WebView',
  ],
  exports: [
    'url$'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) Events.unfollow(old.homepage$, this.url$);
        if ( nu ) { Events.follow(nu.homepage$, this.url$); }
      },
    },
    {
      model_: 'StringProperty',
      name: 'url',
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk id="%%id" <%= this.cssClassAttr() %>>
        $$data{ model_: 'foam.apps.builder.KioskChromeView' }
        $$data{
          model_: 'foam.apps.builder.WebView',
          extraClassName: 'kiosk-webview',
        }
      </kiosk>
    */},
    function CSS() {/*
      kiosk {
        position: relative;
        flex-direction: column;
      }
      kiosk, kiosk .kiosk-webview {
        display: flex;
        flex-grow: 1;
      }
      kiosk kiosk-chrome {
        z-index: 2;
      }
      kiosk .kiosk-webview {
        z-index: 1;
      }
    */},
  ],
});
