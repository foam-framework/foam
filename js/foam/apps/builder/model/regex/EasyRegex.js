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
  name: 'EasyRegex',
  package: 'foam.apps.builder.model.regex',

  documentation: function() {/* Use to represent a
    $$DOC{ref:'StringProperty.pattern'}. Allows a user to easily
    build a particular type of regular expression for pattern matching.
  */},

  label: 'No pattern matching',

  messages: {
    errorNoMatch: 'The value does not match the pattern.',
  },

  properties: [
    {
      type: 'String',
      name: 'error',
      label: 'Error Message',
    }
  ],

  methods: [
    function toString() {
      return '';
    },
    function errorMessage() {
      if ( this.error ) return this.error;
      return this.ERROR_NO_MATCH.replaceValues(this.parameter || '');
    },
    function test(val) {
      return (new RegExp(this.toString())).test(val);
    },
  ],
});
