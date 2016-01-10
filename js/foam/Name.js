/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO(mark): document, also, isn't this inefficient?
CLASS({
  package: 'foam',
  name: 'Name',

  requires: [ 'foam.Memo' ],

  properties: [
    {
      type: 'String',
      name: 'initial',
      required: true
    },
    {
      type: 'StringArray',
      name: 'parts'
    },
    {
      type: 'Function',
      name: 'toUpperCamel',
      factory: function() {
        return this.Memo.create({
          f: function() {
            return this.parts.map(function(p) {
              return p.charAt(0).toUpperCase() + p.slice(1);
            }).join('');
          }
        }).get();
      }
    },
    {
      type: 'Function',
      name: 'toLowerCamel',
      factory: function() {
        return this.Memo.create({
          f: function() {
            return this.parts[0].toLowerCase() +
                this.parts.slice(1).map(function(p) {
                  return p.charAt(0).toUpperCase() + p.slice(1);
                }).join('');
          }
        }).get();
      }
    },
    {
      type: 'Function',
      name: 'toHyphen',
      factory: function() {
        return this.Memo.create({
          f: function() {
            return this.parts.map(function(p) {
              return p.toLowerCase();
            }).join('-');
          }
        }).get();
      }
    },
    {
      type: 'Function',
      name: 'toUpperUnderscore',
      factory: function() {
        return this.Memo.create({
          f: function() {
            return this.parts.map(function(p) {
              return p.toUpperCase();
            }).join('_');
          }
        }).get();
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);

        var str = this.initial, match = str.match(/^[^A-Z]*/), prefix = '';
        // Handle lowercase match.
        if ( match && match[0] ) {
          prefix = match[0];
          this.parts.push(prefix);
          str = str.slice(prefix.length);
        }
        // Handle either
        // ABC... (all uppercase)
        // or
        // Abc... (any non-uppercase after A).
        while ( str ) {
          match = str.match(/^[A-Z]+/);
          if ( match && match[0] && match[0].length > 1 ) {
            prefix = (match[0].length === str.length ?
                match[0] : match[0].slice(0, match[0].length - 1));
            this.parts.push(prefix);
            str = str.slice(prefix.length);
            continue;
          }
          match = str.match(/^[A-Z][^A-Z]*/);
          if ( match && match[0] ) {
            prefix = match[0];
            this.parts.push(prefix);
            str = str.slice(prefix.length);
          }
        }

        // var str = this.initial, upper = false, startIdx = 0, parts = [], i;
        // for ( i = 0; i < str.length; ++i ) {
        //   var ch = str.charAt(i);
        //   if ( ! upper || ( upper && ch === ch.toUpperCase() ) ) {
        //     upper = ( ch === ch.toUpperCase() );
        //     continue;
        //   }
        //   upper = ( ch === ch.toUpperCase() );
        //   if ( upper ) {
        //     parts.push(str.slice(startIdx, i));
        //     startIdx = i;
        //   }
        // }
        // parts.push(str.slice(startIdx, str.length));
        // this.parts = parts;
      }
    },
    {
      name: 'toModelName',
      code: function() { return this.toUpperCamel(); }
    },
    {
      name: 'toMethodName',
      code: function() { return this.toLowerCamel(); }
    },
    {
      name: 'toPropertyName',
      code: function() { return this.toLowerCamel(); }
    },
    {
      name: 'toTagName',
      code: function() { return this.toHyphen(); }
    },
    {
      name: 'toValueName',
      code: function() { return this.toLowerCamel() + '$'; }
    },
    {
      name: 'toConstantName',
      code: function() { return this.toUpperUnderscore(); }
    },
    {
      name: 'toPropertySymbolName',
      code: function() { return this.toUpperUnderscore(); }
    },
    {
      name: 'toPropertyValueSymbolName',
      code: function() { return this.toUpperUnderscore() + '$'; }
    }
  ]
});
