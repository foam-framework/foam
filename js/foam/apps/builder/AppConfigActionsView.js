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
  name: 'AppConfigActionsView',
  extends: 'foam.ui.SimpleView',
  traits: [ 'foam.ui.md.ToolbarViewTrait' ],

  requires: [
    'foam.apps.builder.ExportConfirmView',
    'foam.apps.builder.ImportExportFlow',
    'foam.apps.builder.ImportExportFlowView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupView',
  ],
  imports: [
    'importExportManager$',
    'dao',
    'stack',
  ],

  properties: [
    'data',
    {
      type: 'ViewFactory',
      name: 'delegate',
      defaultValue: 'foam.ui.md.DetailView',
    },
    'delegateView',
  ],

  methods: [
    function doExportAction(name, title) {
      var confirm = this.aconfirmExportAction.bind(this, name, title);
      var setup = this.asetupExportAction.bind(this, name, title);
      aaif(confirm, aseq(setup, function(ret, exportFlow) {
        this.importExportManager[name](exportFlow);
        ret();
      }.bind(this)))(nop);
    },
    function aconfirmExportAction(name, title, ret) {
      var confirmPopup = this.PopupView.create({
        cardClass: 'md-card-shell',
        data: this.data,
        layoutPosition: 'top',
        blockerMode: 'modal',
        delegate: this.ExportConfirmView.xbind({
          actionName: name,
          title: title + '?',
        }, this.Y),
      }, this.Y);
      confirmPopup.open();
      confirmPopup.delegateView.result(ret);
    },
    function asetupExportAction(name, title, ret) {
      var exportFlow = this.ImportExportFlow.create({
        config$: this.data$,
        actionName: name,
        title: title,
      }, this.Y);
      var popup = this.PopupView.create({
        cardClass: 'md-card-shell',
        blockerMode: 'modal',
        delegate: 'foam.apps.builder.ImportExportFlowView',
        data: exportFlow,
      }, this.Y);
      popup.open();
      ret(exportFlow);
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
      code: function() {
        this.doExportAction('downloadPackage', 'Download Package to Disk');
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
      code: function() {
        this.doExportAction('downloadApp', 'Download Files to Disk');
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
      code: function() {
        this.doExportAction('uploadApp', 'Upload to Chrome Web Store');
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
      code: function() {
        this.doExportAction('publishApp', 'Publish to Chrome Web Store');
      },
    },
    {
      name: 'delete',
      label: 'Delete',
      help: 'Removes this app',
      priority: 2,
      order: 10,
      ligature: 'delete',
      code: function() {
        this.dao.remove(this.data);
      },
    },
  ],

  templates: [
    function toHTML() {/*
     <% this.delegateView = this.delegate({ data$: this.data$ }, this.Y); %>
     <%= this.delegateView %>
    */},
  ],
});
