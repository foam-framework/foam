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
  package: 'foam.apps.builder.events',
  name: 'Presenter',

  properties: [
    {
      name: 'id',
      help: 'The unique id for this record.',
      hidden: true,
    },
    {
      type: 'String',
      name: 'name',
      help: 'The name of the presenter.',
      defaultValue: '',
    },
    {
      type: 'String',
      name: 'description',
      help: 'Short biography of the presenter.',
      defaultValue: '',
    },
    {
      type: 'Image',
      name: 'image',
      help: 'A photo or image of the presenter.',
      defaultValue: '',
    },
    {
      type: 'Color',
      name: 'color',
      help: 'The highlight color to use for this presenter.',
      defaultValue: '#7777FF',
    },
  ],

});
