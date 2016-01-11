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
  name: 'ImportExportManager',

  requires: [
    'foam.apps.builder.DownloadManager',
    'foam.apps.builder.IdentityManager',
    'foam.apps.builder.ImportManager',
    'foam.apps.builder.SourceManager',
    'foam.apps.builder.UploadManager',
    'foam.apps.builder.XHRManager',
  ],
  imports: [
    'appBuilderAnalyticsEnabled$',
    'warn',
  ],
  exports: [
    'sourceManager',
  ],

  properties: [
    {
      name: 'config',
      required: true,
    },
    {
      type: 'Boolean',
      name: 'appBuilderAnalyticsEnabled',
      defaultValue: true,
    },
    {
      name: 'xhrManager',
      documentation: function() {/* Used for registering shared XHR headers.
        Also, use $$DOC{ref:'.xhrManager.Y'} as context for sub-components
        to ensure that its bindings make it into sub-component contexts. */},
      transient: true,
      factory: function() {
        return this.XHRManager.create({}, this.Y);
      },
    },
    {
      name: 'sourceManager',
      transient: true,
      lazyFactory: function() {
        return this.SourceManager.create({
          xhrManager: this.xhrManager,
        }, this.xhrManager.Y);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      // Bind any static HEADERS declared by managers to xhrManager.
      [
        this.UploadManager,
        this.DownloadManager,
        this.SourceManager,
        this.IdentityManager,
      ].map(function(manager) {
        return (manager.constants.filter(function(c) {
          return c.name === 'HEADERS';
        }) || []).map(function(c) {
          return c.value;
        }).reduce(function(acc, headers) {
          return acc.concat(headers);
        }, []);
      }).reduce(function(acc, headers) {
        return acc.concat(headers);
      }, []).forEach(function(headers) {
        this.xhrManager.bindHeaders.apply(this.xhrManager, headers);
      }.bind(this));
    },
    function downloadPackage(exportFlow) {
      this.DownloadManager.create({
        mode: 'PACKAGED',
        data: this.prepareExport(exportFlow),
      }, this.xhrManager.Y).exportApp(exportFlow);
    },
    function downloadApp(exportFlow) {
      this.DownloadManager.create({
        data: this.prepareExport(exportFlow),
      }, this.xhrManager.Y).exportApp(exportFlow);
    },
    function uploadApp(exportFlow) {
      this.UploadManager.create({
        data: this.prepareExport(exportFlow),
      }, this.xhrManager.Y).exportApp(exportFlow);
    },
    function publishApp(exportFlow) {
      this.UploadManager.create({
        data: this.prepareExport(exportFlow),
      }, this.xhrManager.Y).publishApp(exportFlow);
    },
    function importV1App(importFlow) {
      this.ImportManager.create({
        data: importFlow,
      }, this.xhrManager.Y).importV1App(importFlow);
    },
    function importV2App(importFlow) {
      this.ImportManager.create({
        data: importFlow,
      }, this.xhrManager.Y).importV2App(importFlow);
    },
    function prepareExport(exportFlow) {
      return exportFlow;
    },
  ],
});
