/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.documentation.diagram',
  name: 'ExtendsDiagram',
  extends: 'foam.ui.DestructiveDataView',

  requires: [
    'foam.documentation.diagram.ModelDocDiagram',
    'foam.documentation.diagram.DocLinkDiagram',
    'foam.graphics.diagram.LinearLayout',
    'foam.graphics.diagram.Link',
    'foam.graphics.Spacer',
    'SimpleValue',
    'foam.documentation.DocRef'
  ],

  documentation: function() {/*
    A view that renders one model's extendsModel, and recursively builds another ExtendsModel.
  */},

  properties: [
    {
      name: 'diagramItem',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'mainLayout',
      // type: 'foam.graphics.diagram.LinearLayout',
      factory: function() {
        return this.LinearLayout.create({orientation:'vertical'});
      }
    },
    {
      name: 'extended',
      documentation: "The other doc diagram item to point the arrow from."
    },
    {
      name: 'spacing',
      type: 'Int',
      defaultValue: 45
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.mainLayout.verticalConstraints.preferred = 0;
      this.diagramItem.addChild(this.mainLayout);
      var spacer = this.Spacer.create();
      spacer.verticalConstraints.min$ = this.spacing$;
      spacer.stretchFactor = 1;
      this.diagramItem.addChild(spacer);
    },

    shouldDestroy: function(old,nu) {
      return true;
    },

    construct: function() {
      this.SUPER();

      var childX = this.Y.sub({
        documentViewRef: this.SimpleValue.create(
          this.DocRef.create({ ref: this.data.extends })
      )});

      // don't just copy data, find extendsModel and send that to children
      var modelDAO = this.X._DEV_ModelDAO ? this.X._DEV_ModelDAO : this.X.ModelDAO;
      modelDAO.find(this.data.extends, {
          put: function(childData) {
            var thisDiag = this.ModelDocDiagram.create({ data: childData, model: childData }, childX);
            if ( childData.extends ) {
              this.addChild(this.model_.create({ data: childData, extended: thisDiag }, childX));
            }

            this.addChild(thisDiag);

            // the arrow
            this.addChild(this.DocLinkDiagram.create({ start: thisDiag, end$: this.extended$ }));
          }.bind(this)
      });

    },

    addChild: function(child) {
      this.SUPER(child);
      // add diagram node of the child to ours
      if ( this.mainLayout && child.diagramItem ) this.mainLayout.addChild(child.diagramItem);
    },
    removeChild: function(child) {
      if ( this.mainLayout &&  child.diagramItem ) this.mainLayout.removeChild(child.diagramItem);
      this.SUPER(child);
    }
  }
});


