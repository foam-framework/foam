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
  name: 'DesignerView',
  extendsModel: 'foam.ui.View',
  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.AppConfigDetailView',
    'foam.apps.builder.kiosk.KioskView',
    'foam.apps.builder.Panel',
  ],

  properties: [
    'data',
    {
      model_: 'ViewFactoryProperty',
      name: 'panelView',
      defaultValue: {
        factory_: 'foam.apps.builder.Panel',
        innerView: 'foam.apps.builder.AppConfigDetailView',
      }
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

        <% var panelView = this.panelView({
             zIndex: 2,
           }, this.Y);
           var appView = this.appView({
             zIndex: 1,
           }, this.Y);
           this.addDataChild(panelView);
           this.addDataChild(appView); %>

        <%= panelView %>
        <%= appView %>

      </designer>
    */},
    function CSS() {/*
      designer {
        position: relative;
        display: flex;
        flex-grow: 1;
      }
    */},
  ],
});
