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
  name: 'AbstractChoiceView',
  package: 'foam.ui',

  extendsModel: 'foam.ui.LeafDataView',
  traits: ['foam.ui.HTMLViewTrait',
           'foam.ui.TemplateSupportTrait'],

  properties: [
    // This is the real, final choice. The internals use index only.
    // When useSelection is enabled, data is not set until a final choice is made.
    {
      model_: 'BooleanProperty',
      name: 'autoSetData',
      help: 'If true, this.data is set when choices update and the current data is not one of the choices.',
      defaultValue: true
    },
    {
      name: 'text',
      help: 'The user-visible text of the current choice (ie. [value, text] -> text).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][1] === d ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      }
    },
    // See above; choice works the same as data.
    {
      name: 'choice',
      help: 'The current choice (ie. [value, text]).',
      getter: function() {
        var value = this.data;
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(choice) {
        var oldValue = this.choice;
        this.data = choice[0];
        this.text = choice[1];
        this.propertyChange('choice', oldValue, this.choice);
      }
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      documentation: 'Array of [value, text] choices.  Simple String values will be upgraded to [value, value]. Can also be a map, in which case this becomes a [key, value] map in enumeration order.',
      defaultValue: [],
      preSet: function(_, a) {
        // If a is a map, instead of an array, we make [key, value] pairs.
        if ( typeof a === 'object' && ! Array.isArray(a) ) {
          var out = [];
          for ( var key in a ) {
            if ( a.hasOwnProperty(key) )
              out.push([key, a[key]]);
          }
          return out;
        }

        a = a.clone();
        // Upgrade single values to [value, value]
        for ( var i = 0 ; i < a.length ; i++ )
          if ( ! Array.isArray(a[i]) )
            a[i] = [a[i], a[i]];
        return a;
      },
      postSet: function(_, newValue) {
        var value = this.data;

        // Update current choice when choices update.
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var choice = newValue[i];

          if ( value === choice[0] ) {
            if ( this.useSelection ) this.index = i;
            else this.choice = choice;
            break;
          }
        }

        if ( this.autoSetData && i === newValue.length ) {
          if ( this.useSelection ) this.index = 0;
          else this.data = newValue.length ? newValue[0][0] : undefined;
        }

        this.updateHTML();
      }
    },
    // The authoritative selection internally. data and choice are outputs when
    // useSelection is enabled.
    {
      name: 'index',
      help: 'The index of the current choice.',
      preSet: function(_, i) {
        if ( i < 0 || this.choices.length == 0 ) return 0;
        if ( i >= this.choices.length ) return this.choices.length - 1;
        return i;
      },
      postSet: function(_, i) {
        // If useSelection is enabled, don't update data or choice.
        if ( this.useSelection ) return;
        if ( this.data !== this.choices[i][0] ) this.data = this.choices[i][0];
      }
    },
    {
      model_: 'FunctionProperty',
      name: 'objToChoice',
      help: 'A Function which adapts an object from the DAO to a [key, value, ...] choice.'
    },
    {
      name: 'useSelection',
      help: 'When set, data and choice do not update until an entry is firmly selected',
      model_: 'BooleanProperty'
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        this.dao.select(MAP(this.objToChoice))(function(map) {
          // console.log('***** Update Choices ', map.arg2, this.choices);
          this.choices = map.arg2;
        }.bind(this));
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.dao = this.dao;
    },

    onDataChange: function(old,d) {
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][0] === d ) {
          if ( this.index !== i ) {
            this.text = this.choices[i][1];
            this.index = i;
          }
          return;
        }
      }
      if ( d && this.choices.length )
        console.warn('ChoiceView data set to invalid choice: ', d);
    },
    
    findChoiceIC: function(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][1].toLowerCase() == name )
          return this.choices[i];
      }
    },

    commit: function() {
      if ( ! this.useSelection ) return;
      if ( this.choices[this.index] )
        this.choice = this.choices[this.index];
    }
  }
});


