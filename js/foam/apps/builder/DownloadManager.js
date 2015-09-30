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
  name: 'DownloadManager',

  requires: [
    'foam.apps.builder.PackageManager',
    'foam.dao.ChromeFile',
    'foam.dao.ChromeFileSystemDAO',
    'foam.metrics.Error',
    'foam.metrics.Event',
  ],
  imports: [
    'metricsDAO',
    'sourceManager',
  ],

  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'mode',
      defaultValue: 'UNPACKAGED',
      choices: [
        ['UNPACKAGED', 'Unpackaged'],
        ['PACKAGED', 'Packaged'],
      ],
    },
    {
      type: 'foam.apps.builder.ImportExportFlow',
      name: 'data',
    },
    {
      type: 'foam.apps.builder.PackageManager',
      name: 'packageManager',
      lazyFactory: function() {
        return this.PackageManager.create({}, this.Y);
      },
    },
  ],

  methods: [
    function exportApp(data) {
      this.data = data;
      data.state = 'DOWNLOADING';

      var seq = [
        this.sourceManager.aloadSources.bind(this.sourceManager, data.config),
      ];
      if ( this.mode === 'PACKAGED' ) seq.push(
          this.packageManager.prepareSources.bind(this.packageManager, data.config));
      seq.push(
          this.downloadApp.bind(this),
          this.packageManager.checkSources.bind(this));

      aseq.apply(null, seq)(this.finalizeExport.bind(this));
    },
    function downloadApp(ret) {
      var sources = argsToArray(arguments).slice(1);
      var dao = this.ChromeFileSystemDAO.create({}, this.Y);
      var ChromeFile = this.ChromeFile;
      var Y = this.Y;
      apar.apply(
          null,
          sources.map(function(file) {
            return function(ret) {
              var chromeFile = ChromeFile.create({
                path: file.path,
                contents: file.contents,
              }, Y);
              dao.put(chromeFile, {
                put: function() { ret(true); },
                error: function() { ret(false); },
              });
            };
          }))(ret);
    },
    function finalizeExport(status) {
      // TODO(markdittmer): We currently not being notified when the user
      // cancels the request to open a folder. Issue is probably in
      // ChromeFileSystemDAO behaviour.
      if ( status ) {
        this.data.state = 'COMPLETED';
        this.data.details = (this.mode === 'PACKAGED' ? 'Package' : 'Source') +
            ' download complete.';
        this.metricsDAO.put(this.Event.create({
          name: 'Action:export:finish',
          label: this.data.config.model_.id || this.data.config.name_,
        }));
      } else {
        this.data.message = 'Oop! Looks like something went wrong.',
        this.data.details =
            'Did you select a folder for the application to download into?';
        this.data.state = 'FAILED';
        this.metricsDAO.put(this.Error.create({
          name: 'Action:export:fail - ' +
              (this.data.config.model_.id || this.data.config.name_),
        }));
      }
    },
  ],
});
