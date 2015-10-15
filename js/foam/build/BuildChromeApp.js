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
  package: 'foam.build',
  name: 'BuildChromeApp',

  extends: 'foam.build.BuildApp',

  methods: {
    buildModel: function() {
      aseq(
        apar(
          function(ret) { this.buildCoreJS_(ret); }.bind(this),
          function(ret) { this.buildAppJS_(ret); }.bind(this)),
        function(ret, corejs, appjs) {
          this.fileDAO.put(this.File.create({
            path: this.targetPath + this.path.sep + "bg.js",
            contents: corejs + appjs + this.backgroundCode()
          }), {
            put: ret,
            error: function() {
              this.error("ERROR writing bg.js");
              process.exit(1);
            }.bind(this)
          });
        }.bind(this))(function(){ process.exit(0); });
    }
  },

  templates: [
    function backgroundCode() {/*
X.arequire('<%= this.controller %>')(function(m) {
  m.create();
});
*/}
  ]
});
