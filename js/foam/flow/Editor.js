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
  name: 'Editor',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',
  traits: [ 'foam.flow.MultilineViewTrait' ],

  imports: [ 'document' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'src',
      defaultValue: 'console.log("Hello world!");',
      postSet: function(_, nu) {
        if ( ! this.$ ) return;
        if ( nu !== this.$.textContent ) this.$.textContent = nu;
      }
    },
    {
      model_: 'IntProperty',
      name: 'minLines',
      defaultValue: 10
    },
    {
      model_: 'IntProperty',
      name: 'maxLines',
      defaultValue: 20
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! this.$ ) return;
        this.$.addEventListener('input', this.onSrcChange);
        this.$.setAttribute('contenteditable', 'true');
        this.publish(['loaded']);
      }
    }
  ],

  listeners: [
    {
      name: 'onSrcChange',
      code: function(e) {
        if ( ! this.$ ) return;
        if ( this.src !== this.$.textContent ) this.src = this.$.textContent;
      }
    }
  ],

  templates: [
    // Support both <editor>...</editor> and %%myEditor.
    function toInnerHTML() {/*<% if ( this.inner ) { %><%= this.inner() %><% } else { %><%= this.src %><% } %>*/},
    function CSS() {/*
      editor {
        display: block;
        position: relative;
        min-height: 10em;
        max-height: 20em;
        flex-grow: 1;
        padding-left: 4px;
        font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        white-space: pre;
        overflow: auto;
      }
    */}
  ]
});
