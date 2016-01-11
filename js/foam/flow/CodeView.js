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
  package: 'foam.flow',
  name: 'CodeView',
  extends: 'foam.flow.Element',

  traits: [ 'foam.flow.MultilineViewTrait' ],

  requires: [ 'foam.flow.SourceCode' ],

  imports: [
    'document',
    'codeViewLoadState$'
  ],

  properties: [
    {
      name: 'data',
//      type: 'foam.flow.SourceCode',
      factory: function() {
        return this.SourceCode.create();
      }
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        if ( nu === 'read-only' ) this.$.removeAttribute('contenteditable');
        else                      this.$.setAttribute('contenteditable', 'true');
      }
    },
    {
      type: 'Int',
      name: 'minLines',
      defaultValue: 10
    },
    {
      type: 'Int',
      name: 'maxLines',
      defaultValue: 10
    },
    {
      type: 'Int',
      name: 'readOnlyMinLines',
      defaultValue: 2
    },
    {
      type: 'Int',
      name: 'readOnlyMaxLines',
      defaultValue: 10
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! this.$ ) return;
        this.$.addEventListener('input', this.onSrcChange);
        if ( this.mode === 'read-write' )
          this.$.setAttribute('contenteditable', 'true');
        this.codeViewLoadState = 'loaded';
      }
    }
  ],

  listeners: [
    {
      name: 'onSrcChange',
      code: function(e) {
        console.log('a');
        if ( ! this.$ || ! this.data ) return;
        console.log('b');
        if ( this.data.code !== this.$.textContent ) this.data.code = this.$.textContent;
      }
    }
  ],

  templates: [
    // Support both <code-view>...</code-view> and %%myCodeView.
    function toInnerHTML() {/*<% if ( this.inner ) { %>{{this.inner()}}<% } else { %>{{this.data.code}}<% } %>*/},
    function CSS() {/*
      code-view {
        display: block;
        position: relative;
        min-height: 10em;
        max-height: 20em;
        flex-grow: 1;
        padding-left: 4px;
        font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        white-space: pre-wrap;
        overflow: auto;
      }
    */}
  ]
});
