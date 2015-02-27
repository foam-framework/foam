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
  extendsModel: 'foam.flow.Element',

  constants: { ELEMENT: 'foam-book' },

  requires: [
    'foam.flow.TitlePage',
    'foam.flow.BookTitle',
    'foam.flow.SubTitle',
    'foam.flow.Author',
    'foam.flow.ToC',
    'foam.flow.Section'
  ],

  properties: [
    {
      name: 'bookTitle',
      type: 'foam.flow.BookTitle'
    }
  ],

  templates: [
    { name: 'toHTML' },
    { name: 'CSS' }
  ]
});
