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
  name: 'PackageManager',

  requires: [
    'foam.dao.ZipArchiveDAO',
    'foam.util.zip.Archive',
    'foam.util.zip.Chunk',
    'foam.util.zip.File as ZipFile',
  ],

  properties: [
    {
      type: 'foam.util.zip.Archive',
      name: 'archive',
    },
  ],

  methods: [
    function prepareSources(config, ret /* ... sources ... */) {
      var sources = argsToArray(arguments).slice(1);
      var dao = this.ZipArchiveDAO.create({
        archive: this.Archive.create({
          path: config.appName + ' - ' + config.version + '.zip',
        }, this.Y),
      }, this.Y);
      var archive = this.archive = dao.archive;
      var ZipFile = this.ZipFile;
      var Chunk = this.Chunk;
      var Y = archive.Y;

      apar.apply(
          null,
          sources.map(function(file) {
            return function(ret) {
              var zipFile = ZipFile.create({
                fileName: file.path,
                fileContents: Chunk.create({
                  data: file.contents,
                }, Y),
              }, Y);
              dao.put(zipFile, {
                put: function() { ret(true); },
                error: function() { ret(false); },
              });
            };
          }))(this.checkSources.bind(this, ret));
    },
    function checkSources(ret /* ... file indicators: true/false ... */) {
      var indicators = argsToArray(arguments).slice(1);
      if ( indicators.every(function(status) { return status; }) ) {
        ret(this.archive || true);
      } else {
        ret();
      }
    },
  ],
});
