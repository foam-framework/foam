/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

if ( ! this.FOAM_BOOT_DIR ) {
  var path = document.currentScript && document.currentScript.src;

  // document.currentScript isn't supported on all browsers, so the following
  // hack gets the job done on those browsers.
  if ( ! path ) {
    var scripts = document.getElementsByTagName('script');
    for ( var i = 0 ; i < scripts.length ; i++ ) {
      if ( scripts[i].src.match(/\/bootFOAM.js$/) ) {
        path = scripts[i].src;
        break;
      }
    }
  }

  path = path.substring(0, path.lastIndexOf('/')+1);

  FOAM_BOOT_DIR = path;
}

function loadScript_(filename) {
  document.writeln(
    '<script type="text/javascript" src="' + FOAM_BOOT_DIR + filename + '"></script>\n');
}

loadScript_('FOAMmodels.js');
loadScript_('bootFOAMMain.js');
