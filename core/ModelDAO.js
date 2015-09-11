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


var __DATA;
(function() {

  // If we're running a foam binary, i/e no ModelDAO, no need to hookup the
  // model dao.
  if ( ! window.FOAM_BOOT_DIR ) return;

  X.ModelDAO = X.foam.core.bootstrap.BrowserFileDAO.create();

  var path = document.location.pathname;
  path = path.substring(0, path.lastIndexOf('/'));

  var pEl = X.document.createElement('a');
  pEl.href = window.FOAM_BOOT_DIR;
  var foamdir = pEl.pathname;
  foamdir = foamdir.substring(0, foamdir.lastIndexOf('/'));
  foamdir = foamdir.substring(0, foamdir.lastIndexOf('/'));

  // If this isn't FOAM's index.html
  // add an additional classpath for ./js/
  if ( foamdir === '' || path.indexOf(foamdir) == -1 ) {
    X.ModelDAO = X.foam.core.bootstrap.OrDAO.create({
      delegate: X.foam.core.bootstrap.BrowserFileDAO.create({
        rootPath: path + '/js/'
      }),
      primary: X.ModelDAO
    });
  }

  // Hookup ModelDAO callback as CLASS and __DATA global functions.
  var oldClass = CLASS;

  MODEL = CLASS = function(json) {
    json.model_ = 'Model';
    if ( document && document.currentScript )
      json.sourcePath = document.currentScript.src;

    if ( document && document.currentScript && document.currentScript.callback )
      document.currentScript.callback(json, oldClass);
    else
      oldClass(json);
  };
  __DATA = function(json) {
    if ( document && document.currentScript ) {
      json.sourcePath = document.currentScript.src;
      document.currentScript.callback &&
          document.currentScript.callback(json, oldClass);
    }
  };
})();
