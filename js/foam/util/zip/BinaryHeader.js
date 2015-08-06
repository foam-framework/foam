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
  name: 'BinaryHeader',

  requires: [
    'foam.util.zip.BinaryIntProperty',
    'foam.util.zip.Chunk',
  ],

  methods: [
    function toChunk() {
      return this.Chunk.create({
        data: this.toBuffer(),
      }, this.Y);
    },
    function binarySize() {
      var binLength = 0;
      var props = this.model_.properties;
      for ( var i = 0; i < props.length; ++i ) {
        if ( this.BinaryIntProperty.isInstance(props[i]) ) {
          binLength += props[i].size;
        }
      }
      return binLength;
    },
    function insertHeader(view, opt_offset) {
      var offset = opt_offset || 0;
      var props = this.model_.properties;
      var s = {
        '2': 'setUint16',
        '4': 'setUint32',
      };
      for ( var i = 0; i < props.length; ++i ) {
        if ( this.BinaryIntProperty.isInstance(props[i]) ) {
          var prop = props[i];
          view[s[prop.size]](offset + prop.offset, this[prop.name],
                             prop.endian === 'LITTLE');
        }
      }
    },
  ],
});
