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
  name: 'AppConfigDetailView',
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.FlatButton',
  ],
  imports: [
    'exportManager$',
  ],

  properties: [
    'data',
    {
      model_: 'ViewFactoryProperty',
      name: 'innerView',
      defaultValue: 'foam.ui.md.DetailView'
    },
  ],

  actions: [
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'export',
      action: function() {
        this.exportManager.config = this.data;
        this.exportManager.exportApp();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <%= this.innerView({ data$: this.data$, }, this.Y) %>
      <app-config-actions>
        $$export{
          model_: 'foam.ui.md.FlatButton',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA1SURBVHjavcwxCgAwEALB6P8ffUUKEbEKOctZ8PwZUJxEcRV3lXQVuZf0fLtqtB5eR1sPWxsHogDjZnwe5wAAAABJRU5ErkJggg==',
          color: '#4285F4',
        }
      </kiosk-config-actions>
    */},
    function CSS() {/*
      app-config-actions {
        margin: 10px;
        display: flex;
        justify-content: flex-end;
      }
      app-config-actions canvas {
        flex-grow: 0;
      }
    */},
  ]
});
