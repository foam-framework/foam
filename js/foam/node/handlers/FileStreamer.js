/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.node.handlers',
  name: 'FileStreamer',
  extends: 'foam.node.handlers.Handler',
  properties: [
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'path',
      hidden: true,
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'zlib',
      hidden: true,
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'fs',
      hidden: true,
    },
  ],
  constants: {
    MIME_TYPES: {
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      __default: 'application/octet-stream',
      '.ft': 'application/x.foam-template'
    }
  },

  methods: [
    function sendFile(fileName, req, res) {
      if ( ! this.fs.existsSync(fileName) ) {
        this.send(res, 404, 'File not found.');
        return true;
      }
      // find MIME type
      var ext = this.path.extname(fileName);
      var mimetype = this.MIME_TYPES[ext] || this.MIME_TYPES.__default;
      if ( mimetype === this.MIME_TYPES.__default ) {
        this.log('Unknown MIME type: ' + ext);
      }
      res.statusCode = 200;
      res.setHeader('Content-type', mimetype);

      // Open the file as a stream.
      this.log('200 OK ' + fileName);
      var stream = this.fs.createReadStream(fileName);
      // zip if allowed
      if ( req.headers["accept-encoding"] &&
           req.headers["accept-encoding"].indexOf("gzip") !== -1 ) {
        res.setHeader('Content-encoding', 'gzip');
        stream.pipe(this.zlib.createGzip()).pipe(res);
      } else {
        stream.pipe(res);
      }

      return true;
    }
  ]
});
