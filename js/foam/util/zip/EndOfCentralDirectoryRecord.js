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
  name: 'EndOfCentralDirectoryRecord',
  extends: 'foam.util.zip.BinaryHeader',

  imports: [
    'numberOfFiles$',
    'sizeOfCentralDirectory$',
    'centralDirectoryStartOffset$',
    'commentLength$',
    'comment$',
  ],

  properties: [
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'signature',
      size: 4,
      defaultValue: (0x06054b50 | 0),
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'numberOfDisks',
      offset: 4,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'centralDirectoryDiskNumber',
      offset: 6,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'centralDirectoryDiskNumber',
      offset: 8,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'numberOfFiles',
      offset: 10,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'sizeOfCentralDirectory',
      size: 4,
      offset: 12,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'centralDirectoryStartOffset',
      size: 4,
      offset: 16,
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'commentLength',
      offset: 20,
    },
  ],


  methods: [
    function toBuffer() {
      var binLength = this.binarySize();
      var len = binLength + this.comment.length;
      var buf = new ArrayBuffer(len);
      var view = new DataView(buf, 0, len);

      this.insertHeader(view);

      for ( var i = binLength; i < len; ++i ) {
        view.setUint8(i, this.comment.charCodeAt(i - binLength));
      }

      return buf;
    },
  ],
});
