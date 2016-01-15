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
  name: 'File',

  ids: [
    'fileName',
  ],

  requires: [
    'foam.util.zip.Chunk',
    'foam.util.zip.DOSDate',
    'foam.util.zip.FileAttributes',
    'foam.util.zip.LocalFileHeader',
    'foam.util.zip.CentralFileHeader',
  ],
  imports: [
    'crc32',
  ],
  exports: [
    'packagedVersion$',
    'minimumVersion$',
    'bitFlag$',
    'compressionMethod$',
    'lastModified$',
    'contentCRC32$',
    'compressedSize$',
    'uncompressedSize$',
    'fileNameLength$',
    'extraFieldLength$',
    'fileCommentLength$',
    'diskNumber$',
    'fileAttrs$',
    'offsetOnDisk$',
    'fileName$',
    'extraField$',
    'fileComment$',
    'type$',
    'encoding$',
    'fileContents$',
  ],

  properties: [
    {
      type: 'Int',
      name: 'packagedVersion',
      // Copied from /usr/bin/zip (Zip 3.0 July 5th 2008) on OS X.
      defaultValue: (0x031E | 0),
    },
    {
      type: 'Int',
      name: 'minimumVersion',
      // Copied from /usr/bin/zip (Zip 3.0 July 5th 2008) on OS X.
      defaultValue: (0x000A | 0),
    },
    {
      type: 'Int',
      name: 'bitFlag',
    },
    {
      type: 'Int',
      name: 'compressionMethod',
    },
    {
      type: 'Int',
      name: 'lastModified',
      lazyFactory: function() {
        return this.DOSDate.create({}, this.Y).toNumber();
      },
    },
    {
      type: 'Int',
      name: 'contentCRC32',
      lazyFactory: function() {
        return this.crc32.fromChunk(this.fileContents);
      },
    },
    {
      type: 'Int',
      name: 'compressedSize',
      lazyFactory: function() {
        return this.fileContents.size();
      },
    },
    {
      type: 'Int',
      name: 'uncompressedSize',
      lazyFactory: function() {
        return this.fileContents.size();
      },
    },
    {
      type: 'Int',
      name: 'fileNameLength',
      lazyFactory: function() {
        return this.fileName.length;
      },
    },
    {
      type: 'Int',
      name: 'extraFieldLength',
      lazyFactory: function() {
        return this.extraField.length;
      },
    },
    {
      type: 'Int',
      name: 'fileCommentLength',
      lazyFactory: function() {
        return this.fileComment.length;
      },
    },
    {
      type: 'Int',
      name: 'diskNumber',
    },
    {
      type: 'foam.util.zip.FileAttributes',
      name: 'fileAttrs',
      lazyFactory: function() {
        return this.FileAttributes.create({}, this.Y);
      },
    },
    {
      type: 'Int',
      name: 'offsetOnDisk',
    },
    {
      type: 'String',
      name: 'fileName',
    },
    {
      name: 'extraField',
      defaultValue: '',
    },
    {
      type: 'String',
      name: 'fileComment',
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'type',
      defaultValue: 'FILE',
      choices: [
        ['FILE', 'File'],
        ['DIR', 'Directory'],
      ],
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'encoding',
      defaultValue: 'TEXT',
      choices: [
        ['TEXT', 'Text'],
        ['BINARY', 'Binary'],
      ],
    },
    {
      type: 'foam.util.zip.Chunk',
      name: 'fileContents',
      lazyFactory: function() { return this.Chunk.create({}, this.Y); },
    },
    {
      type: 'foam.util.zip.LocalFileHeader',
      name: 'localHeader',
      lazyFactory: function() {
        return this.LocalFileHeader.create({}, this.Y);
      },
    },
    {
      type: 'foam.util.zip.CentralFileHeader',
      name: 'centralHeader',
      lazyFactory: function() {
        return this.CentralFileHeader.create({}, this.Y);
      },
    },
  ],
});
