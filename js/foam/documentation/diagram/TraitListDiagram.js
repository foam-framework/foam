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
  name: 'TraitListDiagram',
  extends: 'foam.ui.BaseView',

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
    A view that renders one model's traits.
  */},

  properties: [
    {
      name: 'data',
      adapt: function(old, nu) {
        if ( typeof nu == 'string' ) {
          var modelDAO = this.X._DEV_ModelDAO ? this.X._DEV_ModelDAO : this.X.ModelDAO;
          modelDAO.find(nu, {
              put: function(n) {
                this.data = n;
              }.bind(this)
          });
        }
        return nu;
      },
      postSet: function() {
        if ( ! this.data || ! this.data.model_ ) return;
        this.destroy();
        this.construct();
      }
    },
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
        return this.LinearLayout.create({orientation:'horizontal'});
      }
    },
    {
      name: 'sourceDiag',
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
      this.diagramItem.addChild(this.Spacer.create({stretchFactor: 1}));
      this.diagramItem.addChild(this.mainLayout);
      this.diagramItem.addChild(this.Spacer.create({fixedHeight$: this.spacing$}));
    },

    construct: function() {
      this.SUPER();
      var self = this;

      self.data.traits.forEach( function(trait) {

        var traitModel = self.X.lookup(trait);

        var X = self.X.sub({
          documentViewRef: self.SimpleValue.create(self.DocRef.create({ ref: trait }, self.X))
        });
        var traitDiag = self.ModelDocDiagram.create({ model: Model, data: traitModel, titleColor: 'rgba(30,160,30,255)' }, X);
        self.addChild(traitDiag);
        self.addChild(self.DocLinkDiagram.create({ start: traitDiag, end$: self.sourceDiag$ }));

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


