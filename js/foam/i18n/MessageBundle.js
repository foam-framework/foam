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
  name: 'MessageBundle',
  package: 'foam.i18n',

  ids: ['id'],

  properties: [
    {
      type: 'String',
      name: 'id',
      defaultValue: 'messageBundle'
    },
    {
      type: 'Array',
      name: 'messages',
    }
  ],

  methods: {
    validate: function() {
      var msgs = this.messages;
      var len = msgs.length;
      var ids = {};
      for ( var i = 0; i < len; ++i ) {
        var id = msgs[i].id;
        if ( ids[id] ) return 'Duplicate messages at Id: "' + id + '"';
        ids[id] = true;
      }
      return false;
    }
  }
});
