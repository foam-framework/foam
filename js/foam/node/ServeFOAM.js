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
  package: 'foam.node',
  name: 'ServeFOAM',
  imports: [
    'exportFile',
    'exportDirectory'
  ],
  methods: [
    function execute() {
      this.exportFile('/index.html', global.FOAM_BOOT_DIR + '/../index.html');
      this.exportFile('/index.js', global.FOAM_BOOT_DIR + '/../index.js');
      this.exportFile('/fonts.css', global.FOAM_BOOT_DIR + '/../fonts.css');
      [
        'apps',
        'core',
        'demos',
        'js'
      ].forEach(function(d) {
        this.exportDirectory('/' + d, global.FOAM_BOOT_DIR + '/../' + d);
      }.bind(this));
    }
  ]
});
