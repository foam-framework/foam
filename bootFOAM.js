/*
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

var files = [
  'stdlib',
  'context',
  'event',
  'SimpleValue',
  'JSONUtil',
  'XMLUtil',
  'FOAM',
  'TemplateUtil',
  'AbstractPrototype',
  'ModelProto',
  'metamodel',
  'view',
  'mlang',
  'future',
  'visitor',
  'dao',
  'dao2',
  'StackView',
  'DAOController',
  'DAO2Controller',
  // remove below here
  'models',
  'turntable',
  'dragon'
];

for ( var i = 0 ; i < files.length ; i++ ) {
   // console.log("loading: ", files[i]);
   document.writeln('<script language="javascript" src="' + files[i] + '.js"></script>\n');
}
