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
  name: 'LocalFileHeader',
  extends: 'foam.util.zip.BinaryHeader',

  imports: [
    'console',
    'crc32',
    'minimumVersion$ as version$',
    'bitFlag$',
    'compressionMethod$',
    'lastModified$',
    'contentCRC32$',
    'compressedSize$',
    'uncompressedSize$',
    'fileNameLength$',
    'extraFieldLength$',
    'fileName$',
    'extraField$',
    'fileContents$',
  ],

  properties: [
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'signature',
      size: 4,
      defaultValue: (0x04034b50 | 0),
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'version',
      offset: 4,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'bitFlag',
      offset: 6,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'compressionMethod',
      offset: 8,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'lastModified',
      size: 4,
      offset: 10,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'contentCRC32',
      size: 4,
      offset: 14,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'compressedSize',
      size: 4,
      offset: 18,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'uncompressedSize',
      size: 4,
      offset: 22,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'fileNameLength',
      offset: 26,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'extraFieldLength',
      offset: 28,
    },
  ],

  methods: [
    function size() {
      return this.binarySize() + this.fileName.length + this.extraField.length;
    },
    function toBuffer() {
      var binLength = this.binarySize();
      var extraFieldOffset = binLength + this.fileName.length;
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

      return buf;
    },
  ],
});
