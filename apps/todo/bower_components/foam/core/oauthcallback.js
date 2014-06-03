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
window.onload = function() {
  var hash = window.location.hash.substr(1);
  var chunks = hash.split('&');

  var params = {};
  var callbackid;

  for (var i = 0; i < chunks.length; i++) {
    var parts = chunks[i].split('=');
    if (parts[0] == 'state') callbackid = decodeURIComponent(parts[1]);
    else if (parts[0] == 'access_token') params.token = decodeURIComponent(parts[1]);
    else if (parts[0] == 'token_type') params.type = decodeURIComponent(parts[1]);
    else if (parts[0] == 'expires_in') params.expire = decodeURIComponent(parts[1]);
  }

  if (!callbackid) {
    console.log('No callback id returned');
  }

  window.opener['__oauth_' + callbackid](params);
  window.close();
};
