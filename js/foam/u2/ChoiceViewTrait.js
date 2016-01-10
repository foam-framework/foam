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
  package: 'foam.u2',
  name: 'ChoiceViewTrait',

  properties: [
    {
      type: 'Boolean',
      name: 'autoSetData',
      documentation: 'When true, this.data will be set if choices are set ' +
          'and the current data is not one of the choices.',
      defaultValue: true
    },
    {
      name: 'label',
      documentation: 'The user-visible label for this View. Not to be ' +
          'confused with $$DOC{ref:".text"}, the name of the currently ' +
          'selected choice.',
      postSet: function(old, nu) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][1] === nu ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      },
    },
    {
      name: 'choice',
      documentation: 'The current choice (ie. [value, text] pair).',
      getter: function() {
        var value = this.data;
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(nu) {
        var oldValue = this.choice;
        this.data = nu[0];
        this.text = nu[1];
        this.propertyChange('choice', oldValue, this.choice);
      }
    },
    {
      name: 'choices',
      // type: 'Array[StringField]',
      documentation: 'Array of [value, text] choices. Simple String values ' +
          'are expanded to [str, str]. Can also be a map, which results in ' +
          '[key, value] pairs listed in enumeration order.',
      factory: function() { return []; },
      preSet: function(_, a) {
        if ( typeof a === 'object' && ! Array.isArray(a) ) {
          var out = [];
          for ( var key in a )
            if ( a.hasOwnProperty(key) )
              out.push([key, a[key]]);

          return out;
        }

        a = a.clone();
        // Upgrade single values to [value, value].
        for ( var i = 0 ; i < a.length ; i++ )
          if ( ! Array.isArray(a[i]) )
            a[i] = [a[i], a[i]];

        return a;
      },
      postSet: function(old, nu) {
        var value = this.data;

        // Update current choice when choices update.
        for ( var i = 0 ; i < nu.length ; i++ ) {
          var choice = nu[i];
          if ( value === choice[0] ) {
            if (this.useSelection) {
              this.index = i;
            } else {
              this.choice = choice;
            }
            break;
          }
        }

        if ( this.autoSetData && i === nu.length ) {
          if (this.useSelection) {
            this.index = 0;
          } else {
            this.data = nu.length ? nu[0][0] : undefined;
          }
        }

        // TODO(braden): Make sure that updating the labels, with or without
        // changing the length of choices, updates the DAO properly.
      },
    },
    {
      type: 'Int',
      name: 'index',
      documentation: 'The index of the current choice in $$DOC{ref:".choices"}.',
      transient: true,
      defaultValue: -1,
      preSet: function(old, nu) {
        if (nu < 0 || this.choices.length === 0) return 0;
        if (nu >= this.choices.length) return this.choices.length - 1;
        return nu;
      },
      postSet: function(old, nu) {
        // If useSelection is enabled, don't update data or choice.
        if (this.useSelection) return;
        if (this.choices.length && this.data !== this.choices[nu][0])
          this.data = this.choices[nu][0];
      },
    },
    {
      type: 'String',
      name: 'placeholder',
      defaultValue: '',
      documentation: 'Default entry that is "selected" when $$DOC{ref:".data"} is empty.',
    },
    {
      type: 'Function',
      name: 'objToChoice',
      documentation: 'A Function which adapts an object from the DAO to a [key, value, ...] choice.'
    },
    {
      type: 'Boolean',
      name: 'useSelection',
      documentation: 'When set, data and choice do not update until an entry is firmly selected',
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][0] === nu ) {
            if ( this.index !== i ) {
              this.text = this.choices[i][1];
              this.index = i;
            }
            return;
          }
        }
        if ( ! nu && this.autoSetData ) {
          if (this.useSelection) {
            this.index = 0;
          } else if ( this.choices.length ) {
            this.data = this.choices[0][0];
          }
        }
        if ( nu && this.choices.length )
          console.warn('ChoiceView data set to invalid choice: ', nu);
      }
    },
    {
      name: 'text',
      documentation: 'The label for the currently selected choice. (ie. choice[1]).',
    },
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select(MAP(this.objToChoice))(function(map) {
          this.choices = map.arg2;
        }.bind(this));
      }
    },
  ],

  methods: [
    function findChoiceIC(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ )
        if ( this.choices[i][1].toLowerCase() === name )
          return this.choices[i];
    },
    function valueToIndex(value) {
      for ( var i = 0 ; i < this.choices.length ; i++ )
        if ( this.choices[i][0] == value )
          return i;
    },
    function commit() {
      if ( this.useSelection && this.choices[this.index] )
        this.choice = this.choices[this.index];
    },
    function fromProperty(prop) {
      this.SUPER(prop);
      this.label = this.label || prop.label;
      this.choices = this.choices.length ? this.choices : prop.choices;
    }
  ]
});
