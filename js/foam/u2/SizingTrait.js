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
  package: 'foam.u2',
  name: 'SizingTrait',
  documentation: 'Adds minimum, preferred and maximum width and height properties. These are used by the StackView.',
  properties: [
    {
      name: 'minWidth',
      documentation: 'Allows specifying the minimum width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.u2.StackView"}.',
      defaultValue: 300
    },
    {
      name: 'minHeight',
      documentation: 'Allows specifying the minimum height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.u2.ScrollView"}.',
      defaultValue: 0
    },
    {
      name: 'preferredWidth',
      documentation: 'Allows specifying the preferred width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.u2.StackView"}.',
      defaultValue: 400
    },
    {
      name: 'preferredHeight',
      documentation: 'Allows specifying the preferred height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.u2.ScrollView"}.',
      defaultValue: 40
    },
    {
      name: 'maxWidth',
      documentation: 'Allows specifying the maximum width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.u2.StackView"}.',
      defaultValue: 10000
    },
    {
      name: 'maxHeight',
      documentation: 'Allows specifying the maximum height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.u2.ScrollView"}.',
      defaultValue: 10000
    },
  ]
});
