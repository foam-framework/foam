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
  package: 'foam.chrome',
  name: 'AppController',

  requires: [
    'Binding',
    'PersistentContext',
    'foam.dao.IDBDAO',
    'foam.chrome.AppContext'

  ],
  imports: [
    'document'
  ],
  exports: [
  ],

  properties: [
    {
      name: 'persistentContext',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      }
    },
    {
      type: 'foam.chrome.AppContext',
      name: 'ctx',
      transient: true,
      view: 'foam.ui.DetailView'
    },
    {
      name: 'app'
    }
  ],

  methods: [
    function init() {
      this.persistentContext.bindObject(
          'ctx', this.AppContext, undefined, 1);
    }
  ]
});
