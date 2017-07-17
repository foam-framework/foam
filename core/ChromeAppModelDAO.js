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

(function() {
  X.ModelDAO = X.foam.core.bootstrap.ChromeAppFileDAO.create();

  // Hookup ModelDAO callback as CLASS and __DATA global functions.
  var oldClass = CLASS;

  window.MODEL = CLASS = function(json) {
    json.model_ = 'Model';
    if ( document && document.currentScript && document.currentScript.callback )
      document.currentScript.callback(json, oldClass);
    else
      oldClass(json);
  };
  window.__DATA = function(json) {
    if ( document && document.currentScript ) {
      json.sourcePath = document.currentScript.src;
      document.currentScript.callback &&
          document.currentScript.callback(json, oldClass);
    }
  };
})();
