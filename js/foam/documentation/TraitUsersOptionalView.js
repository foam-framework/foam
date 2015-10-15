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
  package: 'foam.documentation',
  name: 'TraitUsersOptionalView',
  extends: 'foam.documentation.DocOptionalView',

  properties: [
    {
      name: 'data',
      hidden: false
    }
  ],

  templates: [
    function toInnerHTML()    {/*
      <% if ( this.hasContent ) {  %>
        <p class="important">Used by: $$data{ model_: 'foam.documentation.TextualDAOListView', rowView: 'foam.documentation.DocFeatureModelDataRefView', mode: 'read-only' }</p>
      <% } %>
    */}
  ]

});
