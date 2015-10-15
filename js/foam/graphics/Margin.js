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
  package: 'foam.graphics',
  name: 'Margin',
  extends: 'foam.graphics.CView',
  traits: [
    'foam.patterns.layout.MarginTrait',
    'foam.patterns.layout.LayoutItemHorizontalTrait',
    'foam.patterns.layout.LayoutItemVerticalTrait'
  ],
  documentation: function() {/* A container that places a margin around
    a single child item. The layout constraints of the child are adjusted
    by the margin amount, and any size changes to the $$DOC{ref:'foam.graphics.Margin'}
    container are relayed to the child.
  */},
});

