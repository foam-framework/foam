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
// Workers don't get a console object.  We should model our own loggin system.
var console = {
  log: function() {},
  warn: function() {},
  error: function() {},
  info: function() {},
  time: function() {},
  timeEnd: function() {}
};

// We also don't get a window or document object, we should find a way to
// encapsulate our refernces to this or model a wrapper.
var window = self;
var document = {};
var chrome = {};

if (! self.FOAM_BOOT_DIR) self.FOAM_BOOT_DIR = '/';

// FIXME: Workers should be able to bootstrap just from a Model DAO and only
// load the models it needs.
importScripts(FOAM_BOOT_DIR + 'FOAMmodels.js');
for (var i = 0; i < files.length; i++) {
  files[i] = FOAM_BOOT_DIR + files[i] + '.js';
}
importScripts.apply(self, files);
