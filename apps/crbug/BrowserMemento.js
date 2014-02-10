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

MementoMgr.BACK.iconUrl = 'images/back.png';
MementoMgr.FORTH.iconUrl = 'images/forth.png';
MementoMgr.BACK.label = '';
MementoMgr.FORTH.label = '';
MementoMgr.BACK.help = '';
MementoMgr.FORTH.help = '';


var MementoProperty = FOAM({
  model_: 'Model',

  name: 'MementoProperty',

  extendsModel: 'Property',

  properties: [
    { name: 'toString'   },
    { name: 'fromString' }
  ]
});


var Memento = FOAM({
  model_: 'Model',

  name: 'Memento',

  properties: [
    {
      model_: 'MementoProperty',
      name: 'q',
      toString: function(q) {
        // Replace short-names will fullnames that crbug will understand
        return (QueryParser.parseString(q) || TRUE).partialEval().toMQL();
      },
      fromString: function(q) { return q; }
    },
    {
      model_: 'MementoProperty',
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
      model_: 'MementoProperty',
      name: 'mode',
      toString: function(mode) { return mode.label.toLowerCase(); },
      fromString: function(mode) { return mode.capitalize(); }
    },
    {
      model_: 'MementoProperty',
      name: 'colspec',
      defaultValue: null,
      toString: function(properties) { return properties.join(' '); },
      fromString: function(colspec) { return colspen.join(' '); }
    },
    {
      model_: 'MementoProperty',
      name: 'sort',
      toString: function(sortOrder) { return sortOrder.toMQL(); },
      fromString: function(sort) {
        var ps = sort.split(' ');
        for ( var i = 0 ; i < ps.length ; i++ ) {
          var p = ps[i];
          if ( p.charAt('0') == '-' ) {
            ps[i] = DESC(this.model.getProperty(p.substring(1)));
          } else {
            ps[i] = this.model.getProperty(p);
          }
        }
        return ( ps.length == 1 ) ? ps[0] : CompoundComparator.apply(null, ps) ;
      }
    },
    {
      model_: 'MementoProperty',
      name: 'tile',
      toString: function(choice) { return choice[1].toLowerCase(); },
      fromString: function(title) {debugger;}
    },
    {
      model_: 'MementoProperty',
      name: 'y',
//      defaultValue: QIssue.OWNER,
      valueFactory: function() { return QIssue.OWNER; },
      toString: function(y) { return y.name; },
      fromString: function(name) { return QIssue.getProperty(name); }
    },
    {
      model_: 'MementoProperty',
      name: 'x',
//      defaultValue: QIssue.STATUS,
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
        if ( this[key] ) {
          s += d;
          s += key + '=' + encodeURIComponent(prop.toString.call(browser, this[key]));
          d = '&';
        }
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
        this[key] = prop.fromString.call(browser, value);
      }
      
      return this;
    }
  }
});