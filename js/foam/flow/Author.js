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
  name: 'Author',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      model_: 'StringProperty',
      name: 'firstName'
    },
    {
      model_: 'StringArrayProperty',
      name: 'middleNames',
      singular: 'middleName',
      type: 'Array[String]',
      factory: function() { return []; },
      preSet: function(old, nu) {
        if ( typeof nu !== 'string' ) return nu;
        return this.replaceAll(nu.trim(), /[ \t\n\r][ \t\r\n]/g, ' ');
      }
    },
    {
      model_: 'StringProperty',
      name: 'lastName'
    },
    {
      model_: 'StringProperty',
      name: 'email'
    },
    {
      model_: 'StringProperty',
      name: 'middleInitials',
      getter: function() {
        return this.middleNames.map(function(mn) {
              return mn.charAt(0).toUpperCase();
            });
      }
    },
    {
      model_: 'StringProperty',
      name: 'fullName',
      getter: function() {
        debugger;
        return this.firstName +
            (this.middleNames.length > 0 ? ' ' + this.middleNames.join(' ') : '') +
            (this.lastName ? ' ' + this.lastName : '');
      }
    },
    {
      model_: 'StringProperty',
      name: 'shortFullName',
      getter: function() {
        return this.firstName +
            (this.middleNames.length > 0 ?
            ' ' + this.middleInitials.join('. ') + '.' : '') +
            (this.lastName ? ' ' + this.lastName : '');
      }
    },
    {
      model_: 'StringProperty',
      name: 'invertedName',
      getter: function() {
        return this.lastName + ',' +
            (this.firstName ? ' ' + this.firstName : '') +
            (this.middleNames.length > 0 ?
            ' ' + this.middleNames.join(' ') : '');
      }
    },
    {
      model_: 'StringProperty',
      name: 'shortInvertedName',
      getter: function() {
        return this.lastName + ',' +
            (this.firstName ? ' ' + this.firstName : '') +
            (this.middleNames.length > 0 ?
            ' ' + this.middleInitials
            .join('. ').slice(0, this.middleNames.length - 1) : '');
      }
    }
  ],

  templates: [
    function toInnerHTML() {/* %%shortFullName */},
    function CSS() {/*
      @media not print {

        title-page > author {
          margin-top: 3px;
        }

      }

      @media print {
        title-page > author {
          margin-top: 0.05in;
        }

      }
    */}
  ]
});
