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
  name: 'DocFeatureView',
  extends: 'foam.documentation.DocView',
  help: 'A generic view for each item in a list of documented features.',

  requires: ['foam.documentation.DocFeatureInheritanceTracker as DocFeatureInheritanceTracker'],

  imports: ['featureDAO'],

  properties: [
    {
      name: 'overridesDAO',
      model_: 'foam.core.types.DAOProperty',
      factory: function() { return []; }
    },
    {
      name: 'extraClassName',
      defaultValue: 'feature-row'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },

  ],

  methods: {
    init: function() {
      this.SUPER();
      // TODO: do this on postSet instead of pipe?
      this.overridesDAO = [];
      this.featureDAO
          .where(
                AND(EQ(this.DocFeatureInheritanceTracker.NAME, this.data.name),
                    EQ(this.DocFeatureInheritanceTracker.IS_DECLARED, true))
          )
          .orderBy(DESC(this.DocFeatureInheritanceTracker.INHERITANCE_LEVEL))
          .pipe(this.overridesDAO);
    }
  },

  templates: [
    function toInnerHTML() {/*
      <div id="scrollTarget_<%=this.data.name%>">
        <p class="feature-heading"><%=this.data.name%></p>
        <p>$$documentation{ model_: 'foam.documentation.DocBodyView' }</p>
        <p class="inheritance-info">Declared in: $$overridesDAO{ model_: 'foam.documentation.TextualDAOListView', rowView: 'foam.documentation.DocFeatureOverridesRefView', model: this.DocFeatureInheritanceTracker, mode: 'read-only' }</p>
      </div>
    */}
  ]
});
