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
  package: 'foam.util.zip',
  name: 'Archive',

  requires: [
    'foam.util.zip.CRC32',
    'foam.util.zip.Chunk',
    'foam.util.zip.EndOfCentralDirectoryRecord',
  ],
  exports: [
    'crc32',
    'numberOfFiles$',
    'sizeOfCentralDirectory$',
    'centralDirectoryStartOffset$',
    'commentLength$',
    'comment$',
  ],

  properties: [
    {
      name: 'path',
      defaultValue: 'archive.zip',
    },
    {
      name: 'contents',
      getter: function() {
        return this.toData();
      },
    },
    {
      name: 'size',
      getter: function() { return this.toChunk().size(); },
    },
    {
      type: 'foam.util.zip.CRC32',
      name: 'crc32',
      factory: function() {
        return this.CRC32.create({}, this.Y);
      },
      hidden: true,
    },
    {
      type: 'Int',
      name: 'numberOfFiles',
    },
    {
      type: 'Int',
      name: 'sizeOfCentralDirectory',
    },
    {
      type: 'Int',
      name: 'centralDirectoryStartOffset',
    },
    {
      type: 'String',
      name: 'commentLength',
      lazyFactory: function() {
        return this.comment.length;
      },
    },
    {
      type: 'String',
      name: 'comment',
    },
    {
      type: 'Array',
      subType: 'foam.util.zip.File',
      name: 'files',
    },
    {
      type: 'foam.util.zip.EndOfCentralDirectoryRecord',
      name: 'endOfCentralDirectoryRecord',
      lazyFactory: function() {
        return this.EndOfCentralDirectoryRecord.create({}, this.Y);
      },
    },
  ],

  methods: [
    function computeProperties() {
      var n = this.files.length;
      var cdSize = 0;
      var cdOffset = 0;

      for ( var i = 0; i < n; ++i ) {
        var file = this.files[i];

        // Offset of current file is computed offset so far (which includes
        // local header + data from each previous file).
        file.offsetOnDisk = cdOffset;

        cdSize += file.centralHeader.size();
        cdOffset += file.localHeader.size() + file.fileContents.size();
      }

      this.numberOfFiles = n;
      this.sizeOfCentralDirectory = cdSize;
      this.centralDirectoryStartOffset = cdOffset;
      this.commentLength = this.comment.length;
    },
    function toBlob() {
     return new Blob(this.toData(), { type : 'application/zip' });
    },
    function toFile() {
     return new File(this.toData(), this.path);
    },
    function toData() {
      return this.toChunk().data;
    },
    function toChunk() {
      // TODO(markdittmer): This should probably be reactive instead, but
      // waiting until we store the archive avoids recomputing it every time
      // something changes.
      this.computeProperties();

      return this.Chunk.create({
        data: [
          // | local header 1 | local file 1 | ... | local header n | local file n |
          this.files.map(function(file) {
            return file.localHeader.toChunk().append(file.fileContents);
          }.bind(this)),
          // | central header 1 | ... | central header n |
          this.files.map(function(file) {
            return file.centralHeader.toChunk();
          }),
          // | end of central directory record |
          this.endOfCentralDirectoryRecord.toChunk(),
        ],
      }, this.Y);
    },
  ],
});
