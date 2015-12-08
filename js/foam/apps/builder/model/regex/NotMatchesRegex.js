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
  name: 'NotMatchesRegex',
  package: 'foam.apps.builder.model.regex',
  extends: 'foam.apps.builder.model.regex.EasyRegex',

  documentation: function() {/* Use to represent a
    $$DOC{ref:'StringProperty.pattern'}. Allows a user to easily
    build a particular type of regular expression for pattern matching.
    */},

  label:  'Does not match pattern',

  messages: {
    errorNoMatch: 'The value must not match pattern.',
  },

  properties: [
    {
      type: 'String',
      label: 'Regular Expression',
      name: 'parameter',
    }
  ],

  methods: [
    function toString() {
      // add anchoring as match() does, ?! negate the given exp,
      // consume input with .* when exp doesn't match
      return '^(?!'+this.parameter+'$).*$';
    }
  ],
});
