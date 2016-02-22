/**
 * @license
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

CLASS({
  name: 'Relationship',
  tableProperties: [
    'name', 'label', 'relatedModel', 'relatedProperty'
  ],

  documentation: function() { /*
      $$DOC{ref:'Relationship',usePlural:true} indicate a parent-child relation
      between instances of
      a $$DOC{ref:'Model'} and some child $$DOC{ref:'Model',usePlural:true},
      through the indicated
      $$DOC{ref:'Property',usePlural:true}. If your $$DOC{ref:'Model',usePlural:true}
      build a tree
      structure of instances, they could likely benefit from a declared
      $$DOC{ref:'Relationship'}.
    */},

  properties: [
    {
      name:  'name',
      type:  'String',
      displayWidth: 30,
      displayHeight: 1,
      defaultValueFn: function() { return GLOBAL[this.relatedModel] ? GLOBAL[this.relatedModel].plural : ''; },
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */},
      help: 'The coding identifier for the relationship.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      documentation: function() { /* A human readable label for the $$DOC{ref:'.'}. May
        contain spaces or other odd characters.
         */},
      help: 'The display label for the relationship.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
      */},
      help: 'Help text associated with the relationship.'
    },
    {
      type: 'Documentation',
      name: 'documentation',
      documentation: function() { /*
          The developer documentation.
      */}
    },
    {
      name:  'relatedModel',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      documentation: function() { /* The $$DOC{ref:'Model.name'} of the related $$DOC{ref:'Model'}.*/},
      help: 'The name of the related Model.'
    },
    {
      name: 'destinationModel',
      type: 'String',
      required: false,
      displayWidth: 30,
      displayHeight: 1
    },
    {
      name: 'destinationProperty',
      type: 'String',
      required: false,
      displayWidth: 30,
      displayHeight: 1
    },
    {
      name:  'relatedProperty',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      documentation: function() { /*
        The join $$DOC{ref:'Property'} of the related $$DOC{ref:'Model'}.
        This is the property that links back to this $$DOC{ref:'Model'} from the other
        $$DOC{ref:'Model',usePlural:true}.
      */},
      help: 'The join property of the related Model.'
    },
    {
      name: 'toRelationshipE',
      labels: ['javascript'],
      defaultValue: function toRelationshipE(X) {
        return X.lookup('foam.u2.DAOController').create(null, X);
      },
      adapt: function(_, nu) {
        return typeof nu === 'string' ?
            function(X) { return X.lookup(nu).create(null, X); } : nu;
      }
    }
  ],

  methods: [
    function toE(X) {
      return X.lookup('foam.u2.RelationshipView').create({
        relationship: this,
        view: this.toRelationshipE(X)
      }, X);
    },
  ]
  /*,
  methods: {
    dao: function() {
      var m = this.X[this.relatedModel];
      return this.X[m.name + 'DAO'];
    },
    JOIN: function(sink, opt_where) {
      var m = this.X[this.relatedModel];
      var dao = this.X[m.name + 'DAO'] || this.X[m.plural];
      return MAP(JOIN(
        dao.where(opt_where || TRUE),
        m.getProperty(this.relatedProperty),
        []), sink);
    }
  }*/
});


(function() {
  for ( var i = 0 ; i < Model.templates.length ; i++ )
    Model.templates[i] = JSONUtil.mapToObj(X, Model.templates[i]);

  Model.properties = Model.properties;
  delete Model.instance_.prototype_;
  Model = Model.create(Model);
})();

// Go back over each model so far, assigning the new Model to remove any reference
// to the bootstrap Model, then FOAMalize any features that were missed due to
// the model for that feature type ("Method", "Documentation", etc.) being
// missing previously. This time the preSet for each should be fully operational.
function recopyModelFeatures(m) {
  GLOBAL[m.name] = X[m.name] = m;

  m.model_ = Model;

  // the preSet for each of these does the work
  m.methods       = m.methods;
//  m.templates     = m.templates;
  m.relationships = m.relationships;
  m.properties    = m.properties;
//  m.actions       = m.actions;
//  m.listeners     = m.listeners;
  m.models        = m.models;
  if ( DEBUG ) {
    m.tests       = m.tests;
    m.issues      = m.issues;
  }

  // check for old bootstrap Property instances
  if ( m.properties && m.properties[0] &&
       m.properties[0].__proto__.model_.name_ !== 'Model' ) {
    m.properties.forEach(function(p) {
      if ( p.__proto__.model_.name === 'Property' ) p.__proto__ = Property.getPrototype();
    });
  }

  // keep copies of the updated lists
  if ( DEBUG ) BootstrapModel.saveDefinition(m);
}

/*
// Update Model in everything we've created so far
for ( var id in USED_MODELS ) {
  recopyModelFeatures(GLOBAL.lookup(id));
}
*/
recopyModelFeatures(Property);
recopyModelFeatures(Model);
recopyModelFeatures(Method);
recopyModelFeatures(Action);
recopyModelFeatures(Template);

if ( DEBUG ) {
  for ( var id in UNUSED_MODELS ) {
    if ( USED_MODELS[id] ) recopyModelFeatures(GLOBAL.lookup(id));
  }
}

USED_MODELS['Model'] = true;
