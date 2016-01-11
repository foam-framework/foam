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

CLASS({
  package: 'foam.apps.builder',
  name: 'ConfigParser',

  properties: [
    {
      type: 'Function',
      name: 'functionLiteral',
      defaultValue: function() {
        throw new Error('Function object parsed from data-only JSON');
      },
    },
    {
      name: 'parser',
      lazyFactory: function() {
        var cp = this;
        return this.X.JSONParser.addActions({
          'function literal': function(f) {
            return cp.functionLiteral;
          },
          expr: function(expr) {
            if ( expr === 'true' ) {
              return true;
            } else if ( expr === 'false' ) {
              return false;
            } else if ( expr === 'null' ) {
              return null;
            } else {
              return undefined;
            }
          },
          bool: function(str) {
            if ( str === 'true' ) return true; else return false;
          },
          number: function(parts) {
            var sign = parts[0] ? parts[0] : '', intPart = parts[1], decPart = parts[2];
            var left = intPart.join('');
            var dec = decPart && decPart[0] ? decPart[0] : '';
            var right = decPart && decPart[1] ? decPart[1].join('') : '';
            var num = parseFloat(sign + left + dec + right);
            return isNaN(num) ? 0 : num;
          },
        });
      },
    },
  ],
});
