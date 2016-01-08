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
  name: 'AutoSizeDiagramRoot',
  package: 'foam.graphics.diagram',
  extends: 'foam.graphics.LockToPreferredLayout',

  traits: ['foam.graphics.diagram.DiagramItemTrait', 'foam.graphics.diagram.DiagramRootTrait'],

  documentation: function() {/* Use a $$DOC{ref:'foam.graphics.diagram.AutoSizeDiagramRoot'}
    as the root node of your diagram, to provide the shared structure necessary for 
    link routing and to automatically size your canvas. 
    Use $$DOC{ref:'foam.graphics.diagram.DiagramRootTrait'} to create your own
    specialized root type. 
  */},
});

