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
  name: 'FileAttributes',

  imports: [
    'encoding$',
    'type$',
  ],

  properties: [
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'internalAttrs',
      getter: function() {
        return this.type !== 'DIR' && this.encoding !== 'BINARY' ? 0x00 : 0x01;
      },
    },
    {
      model_: 'foam.util.zip.BinaryIntProperty',
      name: 'externalAttrs',
      size: 4,
      offset: 2,
      getter: function() {
        // TODO(markdittmer): Actually model these. The cases handled here are
        // copied from /usr/bin/zip (Zip 3.0 July 5th 2008) on OS X using a zip
        // containing a text file, an image file, and an empty directory.
        return this.type === 'DIR' ?
            0x41ED0010 : (this.encoding === 'TEXT' ?
            0x81A40000 : 0x81A00000);
      },
    },
  ],
});
