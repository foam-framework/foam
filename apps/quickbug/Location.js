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

var LocationProperty = FOAM({
  model_: 'Model',

  name: 'LocationProperty',

  extendsModel: 'Property',

  properties: [
    { name: 'toMemento',      defaultValue:   function(o) { return o; } },
    { name: 'fromMemento',    defaultValue:   function(o) { return o; } },
    { name: 'toURL',          defaultValueFn: function()  { return this.toMemento; } },
    { name: 'defaultMemento', defaultValue:   null }
  ]
});


var Location = FOAM({
  model_: 'Model',

  name: 'Location',

  properties: [
    {
      model_: 'LocationProperty',
      name: 'id'
    },
    {
      model_: 'LocationProperty',
      name: 'createMode',
      defaultValue: false
    },
    {
      model_: 'LocationProperty',
      name: 'can',
      // The memento is the can# stored in the 3rd element of the choice
      // The value of 'can' is the value stored in the 1st element of the choice
      toMemento: function(c) {
        var choices = this.searchChoice.choices;
        for ( var i = 0 ; i < choices.length ; i++ )
          if ( choices[i][0] == c )
            return choices[i][2];
        return choices[1][2];
      },
      fromMemento: function(c) {
        var choices = this.searchChoice.choices;
        for ( var i = 0 ; i < choices.length ; i++ )
          if ( choices[i][2] == c ) return choices[i][0];
        return choices[1][0];
      }
    },
    {
      model_: 'LocationProperty',
      name: 'q',
      defaultValue: '',
      toURL: function(q) {
        // Replace short-names will fullnames that quickbug will understand
        return (QueryParser.parseString(q) || TRUE).partialEval().toMQL().replace(/summary:/g, '');
      }
    },
    {
      model_: 'LocationProperty',
      name: 'mode',
      defaultMemento: 'list',
      toMemento: function(mode) { return mode ? mode.label.toLowerCase() : 'list'; },
      fromMemento: function(mode) {
        var view = this.view.views[0];
        for ( var i = 1 ; i < this.view.views.length ; i++ ) {
          if ( this.view.views[i].label.toLowerCase() === mode ) return this.view.views[i];
        }
        return view;
      }
    },
    {
      model_: 'LocationProperty',
      name: 'colspec',
      preSet: function(_, a) {
        if ( a ) {
          for ( var i = 0 ; i < a.length ; i++ ) {
            var prop = this.getPropertyIC(a[i]);

            if ( prop ) {
              a[i] = prop.name;
            } else {
              a.splice(i,1);
              i--;
            }
          }
        }

        return a;
      },
      toMemento: function(properties) { return properties.join(' '); },
      fromMemento: function(colspec) { return colspec ? colspec.split(' ') : null; }
    },
    {
      model_: 'LocationProperty',
      name: 'sort',
      toMemento: function(sortOrder) { return sortOrder.toMQL(); },
      fromMemento: function(sort) {
        var ps = sort.split(' ');
        for ( var i = 0 ; i < ps.length ; i++ ) {
          var p = ps[i];
          if ( p.charAt('0') == '-' ) {
            ps[i] = DESC(QIssue.getProperty(p.substring(1)));
          } else {
            ps[i] = QIssue.getProperty(p);
          }
        }
        return ( ps.length == 1 ) ? ps[0] : CompoundComparator.apply(null, ps) ;
      }
    },
    {
      model_: 'LocationProperty',
      name: 'cells',
      defaultMemento: 'tiles'
    },
    {
      model_: 'LocationProperty',
      name: 'y',
      defaultValue: QIssue.OWNER,
//      defaultMemento: 'owner',
      toMemento: function(y) { return y.name; },
      fromMemento: function(name) { return QIssue.getProperty(name); }
    },
    {
      model_: 'LocationProperty',
      name: 'x',
      defaultValue: QIssue.STATUS,
//      defaultMemento: 'status',
      toMemento: function(x) { return x.name; },
      fromMemento: function(name) { return QIssue.getProperty(name); }
    }
  ],

  methods: {
    getPropertyIC: function(propName) {
      propName = propName.toLowerCase();
      for ( var i = 0 ; i < QIssue.properties.length ; i++ ) {
        var prop = QIssue.properties[i];

        if ( prop.name.toLowerCase() === propName ) return prop;
      }

      return undefined;
    },

    toURL: function(browser) {
      return this.toMemento(browser, 'toURL');
    },

    fromURL: function(browser, params) {
      return this.fromMemento(browser, decodeURIComponent(params).replace(/\+/g, ' '));
    },

    toMemento: function(browser, opt_methodName) {
      var methodName = opt_methodName || 'toMemento';
      var s = '';
      var d = '';
      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop  = this.model_.properties[i];
        var key   = prop.name;
        try {
          if ( this.hasOwnProperty(key) ) {
            var value = prop[methodName].call(browser, this[key]);
            if ( methodName === 'toURL' ) value = encodeURIComponent(value);
            s += d;
            s += key + '=' + value;
            d = '&';
          }
        } catch (x) {
        }
      }

      return s;
    },

    fromMemento: function(browser, s) {
      // Convert URL into a map
      var m = {};
      var params = s.split('&');
      for ( var i = 0 ; i < params.length ; i++ ) {
        var param    = params[i];
        var keyValue = param.match(/([^=]*)=(.*)/);
        if ( keyValue ) {
          var key      = keyValue[1];
          var value    = keyValue[2];
          m[key] = value;
        }
      }

      // Set or reset each property value
      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];
        var key  = prop.name;
        try {
          if ( m.hasOwnProperty(key) ) {
            var value = prop.fromMemento.call(browser, m[key]);
            this[key] = value;
          } else if ( prop.defaultMemento ) {
            var value = prop.fromMemento.call(browser, prop.defaultMemento);
            this[key] = value;
          } else {
            // revert to the default value, making sure to still fire a propertyChange event
            // TODO: would be better if the Object had a property reset value to do this instead
            var oldValue = this[key];
            delete this.instance_[key];
            this.propertyChange(key, oldValue, this[key]);
          }
        } catch (x) {
        }
      }

      return this;
    }
  }
});