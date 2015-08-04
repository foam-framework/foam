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
      model_: 'IntProperty',
      name: 'packagedVersion',
      // Copied from /usr/bin/zip (Zip 3.0 July 5th 2008) on OS X.
      defaultValue: (0x031E | 0),
    },
    {
      model_: 'IntProperty',
      name: 'minimumVersion',
      // Copied from /usr/bin/zip (Zip 3.0 July 5th 2008) on OS X.
      defaultValue: (0x000A | 0),
    },
    {
      model_: 'IntProperty',
      name: 'bitFlag',
    },
    {
      model_: 'IntProperty',
      name: 'compressionMethod',
    },
    {
      model_: 'IntProperty',
      name: 'lastModified',
      lazyFactory: function() {
        return this.DOSDate.create({}, this.Y).toNumber();
      },
    },
    {
      model_: 'IntProperty',
      name: 'contentCRC32',
      lazyFactory: function() {
        return this.crc32.fromChunk(this.fileContents);
      },
    },
    {
      model_: 'IntProperty',
      name: 'compressedSize',
      lazyFactory: function() {
        return this.fileContents.size();
      },
    },
    {
      model_: 'IntProperty',
      name: 'uncompressedSize',
      lazyFactory: function() {
        return this.fileContents.size();
      },
    },
    {
      model_: 'IntProperty',
      name: 'fileNameLength',
      lazyFactory: function() {
        return this.fileName.length;
      },
    },
    {
      model_: 'IntProperty',
      name: 'extraFieldLength',
      lazyFactory: function() {
        return this.extraField.length;
      },
    },
    {
      model_: 'IntProperty',
      name: 'fileCommentLength',
      lazyFactory: function() {
        return this.fileComment.length;
      },
    },
    {
      model_: 'IntProperty',
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
      model_: 'IntProperty',
      name: 'offsetOnDisk',
    },
    {
      model_: 'StringProperty',
      name: 'fileName',
    },
    {
      name: 'extraField',
      defaultValue: '',
    },
    {
      model_: 'StringProperty',
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
