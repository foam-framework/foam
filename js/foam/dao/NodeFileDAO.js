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
  package: 'foam.dao',
  name: 'NodeFileDAO',
  extends: 'AbstractDAO',
  requires: [
    'foam.dao.File'
  ],
  properties: [
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'path',
      factory: function() { return require('path'); }
    }
  ],
  methods: {
    ensurePath_: function(error, path) {
      path = this.path.normalize(path);
      var parts = path.split(this.path.sep);
      var i = 0;
      var current = '';
      var self = this;
      return awhile(function() { return i < parts.length - 1; },
             aseq(
               function(ret) {
                 current += parts[i++] + self.path.sep;
                 fs.stat(current, ret);
               },
               function(ret, err, data) {
                 if ( err ) {
                   if ( err.code == 'ENOENT' ) {
                     fs.mkdir(current, ret);
                     return;
                   }
                   error && error(err);
                   return;
                 }

                 if ( ! data.isDirectory() ) {
                   error && error(current, ' should be a directory');
                   return;
                 }
                 ret();
               }));
    },
    put: function(file, sink) {
      var normalized = this.path.normalize(file.path);
      aseq(
        this.ensurePath_(sink && sink.error, normalized),
        function(ret) {
          console.log("Writing: ", normalized, file.contents.length);
          this.fs.writeFile(
            normalized,
            file.contents,
            ret);
        },
        function(ret, err) {
          if ( err ) {
            sink && sink.error && sink.error(err);
          }
          file.path = normalized;
          sink && sink.put && sink.put(file);
        })(function(){});
    },
    find: function(path, sink) {
      path = this.path.normalize(path);
      this.fs.readFile(path, function(err, data) {
        if ( err ) {
          console.error(err);
          sink && sink.error && sink.error(err);
          return;
        }
        sink && sink.put && sink.put(this.File.create({
          path: path,
          contents: data.toString('utf8')
        }));
      }.bind(this));
    }
  }
});
