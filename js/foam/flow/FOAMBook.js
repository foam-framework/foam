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
  name: 'FOAMBook',
  package: 'foam.flow',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.flow.Author',
    'foam.flow.ToC',
    'foam.flow.Section'
  ],
  imports: [ 'registerElement' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'FOAM'
    },
    {
      model_: 'StringProperty',
      name: 'subTitle',
      defaultValue: 'The Good Parts'
    },
    {
      model_: 'ArrayProperty',
      name: 'authors',
      singular: 'author',
      type: 'Array[foam.flow.Author]',
      factory: function() {
        return [
          this.Author.create({
            firstName: 'John',
            middleNames: ['Jonny', 'Smitty'],
            lastName: 'Smith',
            email: 'john@smith.com'
          })
        ];
      }
    }
  ],

  templates: [
    { name: 'toHTML' },
    { name: 'CSS' }
  ]
});
