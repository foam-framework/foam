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
  name: 'CentralFileHeader',
  extends: 'foam.util.zip.BinaryHeader',

  imports: [
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
    'fileContents$',
  ],

  properties: [
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'signature',
      size: 4,
      defaultValue: (0x02014b50 | 0),
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'packagedVersion',
      offset: 4,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'minimumVersion',
      offset: 6,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'bitFlag',
      offset: 8,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'compressionMethod',
      offset: 10,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'lastModified',
      size: 4,
      offset: 12,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'contentCRC32',
      size: 4,
      offset: 16,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'compressedSize',
      size: 4,
      offset: 20,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'uncompressedSize',
      size: 4,
      offset: 24,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'fileNameLength',
      offset: 28,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'extraFieldLength',
      offset: 30,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'fileCommentLength',
      offset: 32,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'diskNumber',
      offset: 34,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'internalFileAttrs',
      offset: 36,
      getter: function() { return this.fileAttrs.internalAttrs; },
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'externalFileAttrs',
      size: 4,
      offset: 38,
      getter: function() { return this.fileAttrs.externalAttrs; },
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'offsetOnDisk',
      size: 4,
      offset: 42,
    },
  ],

  methods: [
    function size() {
      return this.binarySize() + this.fileName.length + this.extraField.length +
          this.fileComment.length;
    },
    function toBuffer() {
      var binLength = this.binarySize();
      var extraFieldOffset = binLength + this.fileName.length;
      var fileCommentOffset = extraFieldOffset + this.extraField.length;
      var len = this.size();
      var buf = new ArrayBuffer(len);
      var view = new DataView(buf, 0, len);
      var i;

      this.insertHeader(view);

      for ( i = binLength; i < extraFieldOffset; ++i ) {
        view.setUint8(i, this.fileName.charCodeAt(i - binLength));
      }

      for ( i = extraFieldOffset; i < len; ++i ) {
        view.setUint8(i, this.extraField.charCodeAt(i - extraFieldOffset));
      }

      for ( i = fileCommentOffset; i < len; ++i ) {
        view.setUint8(i, this.fileComment.charCodeAt(i - fileCommentOffset));
      }

      return buf;
    },
  ],
});
