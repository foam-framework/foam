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
  package: 'foam.dao',
  name: 'ZipArchiveDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.util.zip.Archive',
    'foam.util.zip.File',
  ],

  properties: [
    {
      type: 'foam.util.zip.Archive',
      name: 'archive',
      lazyFactory: function() {
        return this.Archive.create({}, this.Y);
      },
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'delegate',
      lazyFactory: function() {
        return this.archive.files.dao;
      },
    },
  ],

  methods: [
    function find(fileName, sink) {
      var file = this.archive.files.filter(function(file) {
        return file.fileName === fileName;
      })[0];
      if ( file ) {
        sink && sink.put && sink.put(file);
        return file;
      } else {
        var err = 'ZipArchiveDAO: File not found';
        sink && sink.error && sink.error(file);
        return err;
      }
    },
  ],
});
