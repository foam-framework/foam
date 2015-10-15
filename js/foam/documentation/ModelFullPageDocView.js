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
  name: 'ModelFullPageDocView',
  extends: 'foam.documentation.ModelDocView',

  documentation: "A full-page documentation view for $$DOC{ref:'Model'} instances.",

  requires:  ['foam.documentation.SummaryDocView',
              'foam.documentation.FeatureListDocView',
  ],

  templates: [

    function toInnerHTML()    {/*
<%    this.destroy(); %>
<%    if (this.data) {  %>
        $$data{ model_: 'foam.documentation.SummaryDocView', model: this.data.model_ }
        <div class="members">
          $$models{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Model, featureType:'models' }
        </div>
        <div class="members">
          $$properties{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Property, featureType:'properties' }
        </div>
        <div class="members">
          $$methods{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Method, featureType:'methods' }
        </div>
        <div class="members">
          $$actions{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Action, featureType:'actions' }
        </div>
        <div class="members">
          $$listeners{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Method, featureType:'listeners' }
        </div>
        <div class="members">
          $$templates{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Template, featureType:'templates' }
        </div>
        <div class="members">
          $$relationships{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Relationship, featureType:'relationships' }
        </div>
        <div class="members">
          $$issues{ model_: 'foam.documentation.FeatureListDocView', model: this.X.Issue, featureType:'issues' }
        </div>
<%    } %>
    */}
  ]

});
