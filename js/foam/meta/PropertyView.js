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
  package: 'foam.meta',
  name: 'PropertyView',
  extendsModel: 'foam.ui.PropertyView',

  documentation: function() {/*
    Pulls the view to use from the property's metaView rather than view.
  */},

//   properties: [
//     {
//       name: 'prop',
//       type: 'Property',
//       documentation: function() {/*
//           The $$DOC{ref:'Property'} for which to generate a $$DOC{ref:'foam.ui.View'}.
//       */},
//       postSet: function(old, nu) {
//         this.model = this.innerView || (nu.model_.name && "foam.meta.types."+nu.model_.name+"View") || nu.metaView;
//       }
//     },
//     {
//       name: 'innerView',
//       help: 'Override for prop.metaView',
//       documentation: function() {/*
//         The optional name of the desired sub-$$DOC{ref:'foam.ui.View'}. If not specified,
//         prop.$$DOC{ref:'Property.metaView'} is used. DEPRECATED. Use $$DOC{ref:'.model'} instead.
//       */},
//     },
//   ],


});
