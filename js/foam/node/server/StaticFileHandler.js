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
  package: 'foam.node.server',
  name: 'StaticFileHandler',
  extendsModel: 'foam.node.server.Handler',
  properties: [
    {
      name: 'path',
      factory: function() { return require('path'); }
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'dir',
      documentation: 'Directory under which to serve files.',
      required: true,
      preSet: function(old, nu) {
        return this.path.resolve(process.cwd(), nu);
      },
      lazyFactory: function() { return process.cwd(); }
    },
    {
      name: 'prefix',
      documentation: 'URL path prefix. Stripped before searching $$DOC{ref:".dir"}.',
      required: true
    },
    {
      name: 'listDirectories',
      documentation: 'When set to true, the server will list directory ' +
          'contents. When false, returns 404s for directories.',
      defaultValue: true
    },
  ],

  constants: {
    LOG_TITLE: 'static',
    MIME_TYPES: {
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      __default: 'application/octet-stream'
    }
  },

  methods: {
    send404: function(res, target) {
      this.send(res, 404, 'File not found: ' + target);
    },
    handle: function(req, res) {
      // Try to serve a static file.
      if ( ! this.dir ) return false;

      // Check the URL for the prefix.
      var target = req.url; // eg. /foo/bar/baz.jpg
      if ( target.indexOf(this.prefix) !== 0 ) return false;

      target = target.substring(this.prefix.length);

      // Check and strip the prefix off the URL.
      if ( target.indexOf('?') >= 0 )
        target = target.substring(0, target.indexOf('?'));
      if ( target.indexOf('#') >= 0 )
        target = target.substring(0, target.indexOf('#'));

      this.verbose('Matched prefix, target file: ' + target);

      // String a leading slash, if any.
      if ( target[0] === '/' ) target = target.substring(1);
      target = this.path.resolve(this.dir, target);
      this.verbose('Target resolved to: ' + target);
      var rel = this.path.relative(this.dir, target);
      this.verbose('Relative path: ' + target);
      // The relative path can't start with .. or it's outside the dir.
      if ( rel.startsWith('..') ) {
        this.send(res, 404, 'Illegal path: Attempts to leave directory.');
        this.warn('Tried to read static file outside directory: ' + target);
        return true;
      }

      // Now we have a legal filename within our subdirectory.
      // We try to stream the file to the other end.
      if ( ! this.fs.existsSync(target) ) {
        this.send404(res, target);
        this.warn('File not found: ' + target);
        return true;
      }

      var stats = this.fs.statSync(target);
      if ( stats.isDirectory() ) {
        if ( ! this.listDirectories ) {
          this.send404(res, target);
          return true;
        }
        // Send the directory listing.
        var title = 'Directory listing for ' + req.url;
        var body = '<html><head><title>' + title + '</title></head><body>';
        body += '<h2>' + title + '</h2><hr /><ul>';

        var files = this.fs.readdirSync(target);
        for ( var i = 0 ; i < files.length ; i++ ) {
          var st = this.fs.statSync(this.path.join(target, files[i]));
          var name = files[i] + (st.isDirectory() ? '/' : '');
          body += '<li><a href="' + name + '">' + name + '</a></li>';
        }
        body += '</ul></body></html>';
        res.setHeader('Content-type', 'text/html');
        res.statusCode = 200;
        res.write(body, 'utf8');
        res.end();
        this.log('200 OK (dir) ' + target);
      } else {
        var ext = this.path.extname(target);
        var mimetype = this.MIME_TYPES[ext] || this.MIME_TYPES.__default;
        if ( mimetype === this.MIME_TYPES.__default ) {
          this.log('Unknown MIME type: ' + ext);
        }
        res.statusCode = 200;
        res.setHeader('Content-type', mimetype);

        // Open the file as a stream.
        this.log('200 OK ' + target);
        var stream = this.fs.createReadStream(target);
        stream.pipe(res);
      }
      return true;
    }
  }
});
