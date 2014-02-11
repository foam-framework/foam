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

  name: 'MementoProperty',

  extendsModel: 'Property',

  properties: [
    { name: 'toString'   },
    { name: 'fromString' }
  ]
});


var Location = FOAM({
  model_: 'Model',

  name: 'Location',

  properties: [
    {
      model_: 'LocationProperty',
      name: 'q',
      toString: function(q) {
        // Replace short-names will fullnames that crbug will understand
        return (QueryParser.parseString(q) || TRUE).partialEval().toMQL();
      },
      fromString: function(q) { return q; }
    },
    {
      model_: 'LocationProperty',
      name: 'can',
      toString: function(c) {
        for ( var i = 1 ; i < this.searchChoice.choices.length ; i++ )
          if ( this.searchChoice.choices[i][0] === c )
            return this.searchChoice.choices[i][2];
        return 2;
      },
      fromString: function(c) {
        for ( var i = 1 ; i < this.searchChoice.choices.length ; i++ )
          if ( this.searchChoice.choices[i][2] == c )
            return this.searchChoice.choices[i][0];
        return this.searchChoice.choices[1][0];
      }
    },
    {
      model_: 'LocationProperty',
      name: 'mode',
      toString: function(mode) { return mode.label.toLowerCase(); },
      fromString: function(mode) {
        var view = this.view.views[0];
        for ( var i = 1 ; i < this.view.views.length ; i++ ) {
          if ( this.view.views[i].label.toLowerCase() == mode ) return this.view.views[i];
        }
        return view;
      }
    },
    {
      model_: 'LocationProperty',
      name: 'colspec',
//      defaultValue: null,
      valueFactory: function() { return null; },
      toString: function(properties) { return properties.join(' '); },
      fromString: function(colspec) { return colspec ? colspec.split(' ') : null; }
    },
    {
      model_: 'LocationProperty',
      name: 'sort',
      toString: function(sortOrder) { return sortOrder.toMQL(); },
      fromString: function(sort) {
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
      name: 'tile',
      toString: function(choice) { return choice; },
      fromString: function(title) { return title; }
    },
    {
      model_: 'LocationProperty',
      name: 'y',
      valueFactory: function() { return QIssue.OWNER; },
      toString: function(y) { return y.name; },
      fromString: function(name) { return QIssue.getProperty(name); }
    },
    {
      model_: 'LocationProperty',
      name: 'x',
      valueFactory: function() { return QIssue.STATUS; },
      toString: function(x) { return x.name; },
      fromString: function(name) { return QIssue.getProperty(name); }
    }
  ],

  methods: {
    toString: function(browser) {
      var s = '';
      var d = '';
      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];
        var key = prop.name;
        var value = '';
        try {
          value = encodeURIComponent(prop.toString.call(browser, this[key]));
        } catch (x) {}
//        if ( this[key] ) {
          s += d;
        s += key + '=' + value;
          d = '&';
  //      }
      }

      return s;
    },

    fromString: function(browser, s) {
      var params = s.split('&');
      for ( var i = 0 ; i < params.length ; i++ ) {
        var param    = params[i];
        var keyValue = param.split('=');
        var key      = decodeURIComponent(keyValue[0]);
        var value    = decodeURIComponent(keyValue[1]).replace(/\+/g, ' ');
        var prop     = this.model_.getProperty(key);
        try {
          this[key] = prop.fromString.call(browser, value);
        } catch (x) {}
      }

      return this;
    }
  }
});