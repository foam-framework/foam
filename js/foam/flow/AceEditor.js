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
  name: 'AceEditor',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  imports: [ 'document' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'pathToAce',
      defaultValue: 'ace-builds/src-noconflict/ace.js'
    },
    {
      model_: 'StringProperty',
      name: 'aceTheme',
      defaultValue: 'ace/theme/textmate'
    },
    {
      model_: 'StringProperty',
      name: 'aceMode',
      defaultValue: 'ace/mode/javascript'
    },
    {
      model_: 'IntProperty',
      name: 'aceTabSize',
      defaultValue: 2
    },
    {
      model_: 'IntProperty',
      name: 'aceMinLines',
      defaultValue: 10
    },
    {
      model_: 'IntProperty',
      name: 'aceMaxLines',
      defaultValue: 15
    },
    {
      model_: 'StringProperty',
      name: 'src',
      defaultValue: 'console.log("Hello world!");',
      postSet: function(_, nu) {
        if ( ! this.editor ) return;
        var editorSrc = this.editor.getValue();
        if ( editorSrc !== nu ) {
          this.editor.setValue(nu);
          this.editor.clearSelection();
        }
      }
    },
    {
      name: 'editor'
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! GLOBAL.ace ) {
          var aceScript = this.document.createElement('script');
          aceScript.src = this.pathToAce;
          aceScript.addEventListener('load', this.onAceLoaded);
          aceScript.addEventListener('error', this.onAceLoadFailed);
          this.document.head.appendChild(aceScript);
        } else {
          this.onAceLoaded();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onAceLoaded',
      code: function() {
        var editor = this.editor = GLOBAL.ace.edit(this.$);
        editor.setOptions({
          theme: this.aceTheme,
          mode: this.aceMode,
          tabSize: this.aceTabSize,
          minLines: this.aceMinLines,
          maxLines: this.aceMaxLines
        });
        editor.setValue(this.src.trim());
        editor.clearSelection();
        editor.getSession().on('change', this.onSrcChange);
        this.publish(['loaded']);
      }
    },
    {
      name: 'onAceLoadFailed',
      code: function() {
        this.publish(['load-failed']);
      }
    },
    {
      name: 'onSrcChange',
      code: function(e) {
        var editorSrc = this.editor.getValue();
        if ( editorSrc !== this.src ) this.src = editorSrc;
      }
    }
  ],

  templates: [
    // Support both <ace-editor>...</ace-editor> and %%myAceEditor.
    function toInnerHTML() {/*<% if ( this.inner ) { %><%= this.inner() %><% } else { %><%= this.src %><% } %>*/},
    function CSS() {/*
      ace-editor {
        display: block;
        font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        flex-grow: 1;
      }
    */}
  ]
});
