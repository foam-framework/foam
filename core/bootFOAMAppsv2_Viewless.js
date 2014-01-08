/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var files = [
    'FOAMViewlessModels'
];

if ( ! this.FOAM_BOOT_DIR ) FOAM_BOOT_DIR = '/';

var withFOAM = function(extra, cb) {
   var script;
    (function loadNextFile() {
        if ( script ) document.body.removeChild(script);
        var file = files.shift();
        if (!file) {
            file = extra ? extra.shift() : undefined;
            if (!file) {
                cb();
                return;
            }
        }
        var src = FOAM_BOOT_DIR + file + '.js';
        var onLoadError = function() {
          // Trying an alternative src location (by flattening the file path).
          // Required for use by external build systems which flatten the
          // directory structure.
          var parts = (file + '.js').split('/');
          var alternativeSrc = FOAM_BOOT_DIR + parts[parts.length - 1];
          loadScript(alternativeSrc, loadNextFile);
        }
        loadScript(src, loadNextFile, onLoadError);
    })();
};


/**
 * @param {string} src The source of the script to be loaded.
 * @param {!Function} callbackFn The function to call after the script has been
 *     loaded.
 * @param {!Function} errbackFn The function to call after the script has been
 *     failed to load.
 */
function loadScript(src, callbackFn, errbackFn) {
  var script = document.createElement('script');
  script.onload = callbackFn;
  script.onerror = errbackFn;
  script.src = src;
  document.body.appendChild(script);
}
