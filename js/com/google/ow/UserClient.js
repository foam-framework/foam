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
  package: 'com.google.ow',
  name: 'UserClient',
  extends: 'foam.ui.SimpleView',
  traits: [
    'foam.memento.MemorableTrait'
  ],

  requires: [
    'com.google.ow.Browser',
    'com.google.ow.Client',
    'foam.memento.FragmentMementoMgr',
  ],
  exports: [
    'currentUserId$',
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'currentUserId',
      memorable: true,
      postSet: function(old, nu, prop) {
        if ( old === nu ) return;
        this.client = this.clientFactory();
        this.updateHTML();
      },
    },
    {
      name: 'client',
      lazyFactory: function() {
        return this.clientFactory();
      },
      postSet: function(old, nu, prop) {
        console.log('Set UserClient.client', nu);
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'clientView',
      defaultValue: function() {
        return this.Browser.create({
          data: this.client,
        }, this.client.Y);
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'clientFactory',
      defaultValue: function() {
        return this.Client.create({
          currentUserId$: this.currentUserId$,
        });
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.FragmentMementoMgr.create({ mementoValue: this.memento$ });
    },
  ],

  templates: [
    function toInnerHTML() {/*%%clientView()*/},
  ],
});
