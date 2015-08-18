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
  traits: [ 'foam.ui.md.ToolbarViewTrait' ],

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
      label: 'Package',
      help: 'Download app as a single archive',
      priority: 1,
      order: 1.0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAQlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfQAWXGFAAAAFXRSTlMALePhKBXghJvbEray/fwg6uhP6U1pY8wzAAAAWklEQVR4Xq3PORKEMAwFUbGJdcZsvv9VSTr4JRIX5c70XySrXNNmqeuNBh9NmuYFWHNoA34R/kB+9RnkKgdPRskFEHYBhF0AYVdA2AUQL31wj3AA5xX226r2ACkvFWPaNFOcAAAAAElFTkSuQmCC',
      ligature: 'archive',
      action: function() {
        var exportFlow = this.setupExportAction('Download Package to Disk');
        this.exportManager.downloadPackage(exportFlow);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'downloadApp',
      label: 'Download',
      help: 'Download app as a series of individual source files',
      priority: 1,
      order: 2.0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA0SURBVHjazdBBCgAgEMNAs/9/tCAEFoo3FeeY3jpuqOWngWrIxd4RXdgD9oA9wLHLtR9emRVOAOP9ZYAiAAAAAElFTkSuQmCC',
      ligature: 'file_download',
      action: function() {
        var exportFlow = this.setupExportAction('Download Files to Disk');
        this.exportManager.downloadApp(exportFlow);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'uploadApp',
      label: 'Upload',
      help: 'Upload app to the Chrome Web Store',
      priority: 3,
      order: 4.0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAA1SURBVHjavcwxCgAwEALB6P8ffUUKEbEKOctZ8PwZUJxEcRV3lXQVuZf0fLtqtB5eR1sPWxsHogDjZnwe5wAAAABJRU5ErkJggg==',
      ligature: 'file_upload',
      action: function() {
        var exportFlow = this.setupExportAction('Upload to Chrome Web Store');
        this.exportManager.uploadApp(exportFlow);
      },
    },
    {
      model_: 'foam.metrics.TrackedAction',
      name: 'publishApp',
      label: 'Publish',
      help: 'Publish app to the Chrome Web Store',
      priority: 3,
      order: 5.0,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVChfRChfRChfRFRUHlAAAAAnRSTlMAgJsrThgAAAAySURBVHjaxY+xDQAACINs/z/akRhj3JQRJuIMF9awIw3e1uAp1VO6p+ApgKcAc3/hkgQRygDjNDsCngAAAABJRU5ErkJggg==',
      ligature: 'publish',
      action: function() {
        var exportFlow = this.setupExportAction('Publish to Chrome Web Store');
        this.exportManager.publishApp(exportFlow);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <%= this.innerView({ data$: this.data$ }, this.Y) %>
    */},
  ]
});
