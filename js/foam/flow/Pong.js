
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
  name: 'Pong',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Section',

  requires: [
    'foam.flow.CodeSnippet',
    'foam.flow.CodeSnippetView',
    'foam.flow.CodeView'
  ],

  properties: [
    {
      name: 'mode',
      defaultValue: 'read-only'
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.X.registerModel(this.CodeSnippetView.xbind({
        mode: 'read-only'
      }), 'foam.flow.CodeSnippetView');
      this.X.registerModel(this.CodeView.xbind({
        mode: 'read-only',
        minLines: 1
      }), 'foam.flow.CodeView');
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
