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
  package: 'foam.core.types',
  name: 'IPv4Property',
  extends: 'StringProperty',
  documentation: function() {/*
      An IP Address v4 property.
  */},
  properties: [
    {
      name: 'privateRange',
      documentation: function() {/*
          Whether or not this IP address falls into the private addresses range,
          according to rfc1918.
      */},
      type: 'Boolean',
      defaultValue: false
    }
  ],
  // Returns '' for valid and a non-empty error string for invalid.
  validate: function(x) {
    var parts = x.split('.');
    if (parts.length != 4) {
      return 'Address must consist of 4 numbers each from 0 to 255';
    }
    for (var i = 0; i < 4; i++) {
      var x = +parts[i];
      if (('' + x) == parts[i] && 0 <= x && x <= 255) {
        parts[i] = x;
      } else { // NaNs are Also weeded out.
        return 'Address must consist of 4 numbers each from 0 to 255';
      }
    }
    if (!this.privateRange) {
      return ''; // Valid.
    }
    if ((parts[0] == 10) ||
        (parts[0] == 172 && (parts[1] & 240) == 16) ||
        (parts[0] == 192 && parts[1] == 168)) {
      return '';  // Valid.
    }
    return 'Address out of the private addresses range.';
  }
});
