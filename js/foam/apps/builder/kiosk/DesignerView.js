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
  name: 'DesignerView',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.apps.builder.AppConfigDetailView',
    'foam.apps.builder.AppConfigSheetView',
    'foam.apps.builder.kiosk.KioskView',
    'foam.ui.VerticalSlidePanel',
  ],

  exports: [
    'url$',
  ],

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
      model_: 'StringProperty',
      name: 'url',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'panel',
      defaultValue: 'foam.apps.builder.AppConfigDetailView',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'appView',
      defaultValue: 'foam.apps.builder.kiosk.KioskView',
    },
  ],

  templates: [
    function toHTML() {/*
      <designer id="%%id" <%= this.cssClassAttr() %>>

        <%= this.VerticalSlidePanel.create({
              data$: this.data$,
              minPanelHeight: 400,
              stripHeight: 12,
              overlapPanels: true,
              mainView: 'foam.apps.builder.kiosk.KioskView',
              panelView: {
                factory_: 'foam.apps.builder.AppConfigDetailView',
                innerView: {
                  factory_: 'foam.apps.builder.AppConfigSheetView',
                  minHeight: 400,
                },
              },
            }, this.Y) %>
      </designer>
    */},
    function CSS() {/*
      designer {
        position: relative;
        display: flex;
        flex-grow: 1;
      }
      designer .SlidePanel {
        flex-grow: 1;
      }
      designer .panel {
        width: 100%;
      }
    */},
  ],
});
