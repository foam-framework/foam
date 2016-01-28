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
  package: 'foam.net',
  name: 'NodeHTTPResponse',
  extends: 'foam.net.HTTPResponse',

  properties: [
    {
      name: 'responseType',
      type: 'foam.core.types.StringEnum',
      defaultValue: 'text',
      choices: [
        [ 'text', 'Text (String)' ],
        [ 'arraybuffer', 'ArrayBuffer' ],
        [ 'buffer', 'Buffer (NodeJS Buffer type)' ],
      ],
    },
    {
      name: 'encoding',
      type: 'foam.core.types.StringEnum',
      defaultValue: 'utf8',
      choices: [
        [ 'utf8', 'UTF-8' ],
        [ 'base64', 'Base-64' ],
        [ 'ucs2', 'UCS2, a.k.a., UTF16 little-endian' ],
        [ 'ascii', 'ASCII' ],
        [ 'utf16le', 'UTF16 little-endian' ],
        [ 'hex', 'Hexadecimal characters' ],
      ],
    },
    {
      name: 'buffers',
      type: 'Array',
      lazyFactory: function() { return []; },
    },
  ],

  methods: [
    function end() {
      var buffer = Buffer.concat(
          this.buffers,
          this.buffers.map(function(b) { return b.length; })
              .reduce(function(acc, len) { return acc + len; }, 0));

      if ( this.responseType === 'buffer' ) {
        this.payload = buffer;
      } else if ( this.responseType === 'arraybuffer' ) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
          view[i] = buffer[i];
        }
        this.payload = ab;
      } else {
        this.payload = buffer.toString(this.encoding);
      }
    },
    function onData(data) {
      this.buffers.push(data);
    },
  ],
});
