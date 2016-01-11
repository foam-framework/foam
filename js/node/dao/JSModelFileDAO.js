/*
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
  package: "node.dao",
  name: "JSModelFileDAO",

  extends: "AbstractDAO",

  properties: [
    {
      name: "daoListeners_",
      hidden: true,
      transient: true,
      factory: function () { return []; }
    },
    {
      name: "fs",
      factory: function () { return require('fs'); }
    },
    {
      name: "path",
      factory: function () { return require('path'); }
    },
    {
      type: 'String',
      name: "prefix",
      defaultValueFn: function () {
        return 'js';
      }
    }
  ],
  methods: [
    {
      name: "put",
      code: function (obj, sink) {
        var path =
            this.path.normalize(this.prefix + this.path.sep +
                                obj.package.replace(/\./g, this.path.sep) +
                                this.path.sep + obj.name + '.js');

        var current = '';
        var parts = path.split(this.path.sep);
        var fs = this.fs;
        var i = 0;
        var self = this;

        var size;
        var buffer;

        aseq(
          awhile(function() { return i < parts.length - 1; },
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

                       sink && sink.error && sink.error(err);
                       return;
                     }

                     if ( ! data.isDirectory() ) {
                       sink && sink.error && sink.error(current, ' should be a directory or not exist.');
                       return;
                     }

                     ret();
                   })),
          aseq(
            function(ret) {
              current += parts[i];
              console.log("Writing to ", current);
              fs.open(current, "w", ret);
            },
            function(ret, err, fd) {
              if ( err ) {
                sink && sink.error && sink.error("Could not open ", current, " for writing. ", err);
                return;
              }

              var buffer = new Buffer(
                self.apache2Header() + "CLASS(" + JSONUtil.prettyModel.where(NOT_TRANSIENT).stringify(obj) + ");\n");
              var offset = 0;

              awhile(
                function() { return offset < buffer.length - 1 },
                aseq(
                  function(ret) {
                    fs.write(fd, buffer, offset, buffer.length, null, ret);
                  },
                  function(ret, err, written, buffer) {
                    if ( err ) {
                      sink && sink.error && sink.error('Write error: ', err);
                      return;
                    }
                    if ( written ) offset += written;
                    ret();
                  }))(ret);
            })
        )(function(){sink && sink.put && sink.put(obj);});
      }
    }
  ],
  templates: [
    {
      name: "apache2Header",
      template: "/**\u000a * @license\u000a * Copyright <%= new Date().getFullYear() %> Google Inc. All Rights Reserved.\u000a *\u000a * Licensed under the Apache License, Version 2.0 (the \"License\");\u000a * you may not use this file except in compliance with the License.\u000a * You may obtain a copy of the License at\u000a *\u000a *     http://www.apache.org/licenses/LICENSE-2.0\u000a *\u000a * Unless required by applicable law or agreed to in writing, software\u000a * distributed under the License is distributed on an \"AS IS\" BASIS,\u000a * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\u000a * See the License for the specific language governing permissions and\u000a * limitations under the License.\u000a */\u000a\u000a"
    }
  ]
});
