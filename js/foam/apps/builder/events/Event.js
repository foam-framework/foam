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
  name: 'Event',

  properties: [
    {
      name: 'id',
      help: 'The unique id for this record.',
      hidden: true,
    },
    {
      model_: 'DateTimeProperty',
      name: 'date',
      help: 'The date and time of the event.',
    },
    {
      model_: 'StringProperty',
      name: 'name',
      help: 'The name of the event.',
      defaultValue: 'New Event',
    },
    {
      model_: 'StringProperty',
      name: 'description',
      help: 'Details of the event.',
      defaultValue: '',
    },
    {
      model_: 'ImageProperty',
      name: 'image',
      help: 'A photo or image to add to the event.',
      defaultValue: '',
    },
    {
      model_: 'StringArrayProperty',
      name: 'tags',
      help: 'Tags on the event indicate what type of event it is (fundraiser, picnic, meeting) or who can see it (public, members-only, private). Use whatever tag names you want, and specify the appropriate ones in your Events Calendar app.',
      defaultValue: '',
    },
    {
      model_: 'ColorProperty',
      name: 'color',
      help: 'The highlight color to use for this event.',
      defaultValue: '#77F',
    },

  ],

});
