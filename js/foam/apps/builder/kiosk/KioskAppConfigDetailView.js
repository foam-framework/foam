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
  name: 'KioskAppConfigDetailView',
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.apps.builder.ExportFlow',
    'foam.apps.builder.ExportFlowView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupView',
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

  methods: [
    function setupExportAction(title) {
      var exportFlow = this.ExportFlow.create({
        config$: this.data$,
        title: title,
      }, this.Y);
      var popup = this.PopupView.create({
        blockerMode: 'modal',
        delegate: 'foam.apps.builder.ExportFlowView',
        data: exportFlow,
      }, this.Y);
      popup.open();
      return exportFlow;
    },
  ],

  actions: [
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'packageDownload',
      action: function() {
        var exportFlow = this.setupExportAction('Download Package to Disk');
        this.exportManager.downloadPackage(exportFlow);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'download',
      action: function() {
        var exportFlow = this.setupExportAction('Download Files to Disk');
        this.exportManager.downloadApp(exportFlow);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'upload',
      action: function() {
        var exportFlow = this.setupExportAction('Upload to Chrome Web Store');
        this.exportManager.uploadApp(exportFlow);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <%= this.innerView({ data$: this.data$, }, this.Y) %>
      <kiosk-config-actions>
        $$packageDownload{
          model_: 'foam.ui.md.FlatButton',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA1SURBVHjavcwxCgAwEALB6P8ffUUKEbEKOctZ8PwZUJxEcRV3lXQVuZf0fLtqtB5eR1sPWxsHogDjZnwe5wAAAABJRU5ErkJggg==',
          color: '#4285F4',
        }
        $$download{
          model_: 'foam.ui.md.FlatButton',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA1SURBVHjavcwxCgAwEALB6P8ffUUKEbEKOctZ8PwZUJxEcRV3lXQVuZf0fLtqtB5eR1sPWxsHogDjZnwe5wAAAABJRU5ErkJggg==',
          color: '#4285F4',
        }
        $$upload{
          model_: 'foam.ui.md.FlatButton',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA1SURBVHjavcwxCgAwEALB6P8ffUUKEbEKOctZ8PwZUJxEcRV3lXQVuZf0fLtqtB5eR1sPWxsHogDjZnwe5wAAAABJRU5ErkJggg==',
          color: '#4285F4',
        }
      </kiosk-config-actions>
    */},
    function CSS() {/*
      kiosk-config-actions {
        margin: 10px;
        display: flex;
        justify-content: flex-end;
      }
      kiosk-config-actions canvas {
        flex-grow: 0;
      }
    */},
  ]
});
