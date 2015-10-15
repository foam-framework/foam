/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
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
  name: 'ModelDescriptionRowView',
  extends: 'foam.ui.View',

  requires: ['SimpleValue'],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        this.modelRef = this.data.package ?
                          this.data.package + "." + this.data.name :
                          this.data.name;
        var shortPkg = this.data.package;
  //       if ( shortPkg.length > 20 ) {
  //         shortPkg = "..." + this.data.package.substring(
  //                     this.data.package.length-10, this.data.package.length);
  //       }
        this.modelName = (shortPkg ? "["+ shortPkg + "] <br/>" : "") + this.data.name;
      }
    },
    {
      name: 'modelName',
      help: 'The Model package and name.'
    },
    {
      name: 'modelRef'
    }
  ],

  methods: {
    init: function() {
      // set up context // TODO: template is compile before we create subcontext
      this.X = this.X.sub({name:'ModelDescriptionRowView_X'});
      this.X.documentationViewParentModel = this.SimpleValue.create();

      this.SUPER();
    }

  },
  templates: [ // TODO: the data gets set on the modelNameView... screws it up
    function toInnerHTML() {/*
      <p class="browse-list-entry">$$modelName{model_:'foam.documentation.DocRefView', ref$: this.modelRef$, text$: this.modelName$}</p>
    */}
  ]
});
