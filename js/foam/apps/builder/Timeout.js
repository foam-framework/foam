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
  name: 'Timeout',

  imports: [
    'clearTimeout',
    'setTimeout',
  ],

  properties: [
    {
      name: 'id',
      defaultValue: null,
    },
    {
      type: 'Function',
      name: 'callback',
      defaultValue: function() {}
    },
    {
      type: 'Int',
      name: 'milliseconds',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.setTime();
      },
    },
    {
      type: 'Float',
      name: 'seconds',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.milliseconds = nu * 1000;
        this.setTime();
      },
    },
    {
      type: 'Float',
      name: 'minutes',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.milliseconds = nu * 1000 * 60;
        this.setTime();
      },
    },
  ],

  actions: [
    {
      name: 'start',
      isEnabled: function() { return this.id === null; },
      code: function() {
        this.id = this.setTimeout(this.callback, this.milliseconds);
      },
    },
    {
      name: 'cancel',
      isEnabled: function() { return this.id !== null; },
      code: function() {
        this.clearTimeout(this.id);
        this.id = null;
      },
    },
    {
      name: 'restart',
      isEnabled: function() { return this.id !== null; },
      code: function() {
        this.cancel();
        this.start();
      },
    },
  ],

  methods: [
    {
      name: 'setTime',
      code: function() {
        this.seconds = this.milliseconds / 1000;
        this.minutes = this.seconds / 60;
      }
    },
  ],
});
