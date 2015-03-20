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
  name: 'AceCodeView',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [ 'foam.flow.SourceCode' ],
  imports: [
    'document',
    'codeViewLoadState$'
  ],

  properties: [
    {
      name: 'data',
      type: 'foam.flow.SourceCode',
      factory: function() {
        return this.SourceCode.create({
          data: 'console.log("Hello world!");'
        });
      },
      postSet: function(old, nu) {
        if ( ! this.codeView ) return;

        if ( old ) old.language$.removeListener(this.onLanguageChange);
        if ( nu ) nu.language$.addListener(this.onLanguageChange);
        if ( ! old || old.languae !== nu.language ) this.onLanguageChange();

        var codeViewCode = this.codeView.getValue();
        if ( codeViewCode !== nu.code ) {
          this.codeView.setValue(nu.code);
          this.codeView.clearSelection();
        }
      }
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
      postSet: function(old, nu) {
        if ( ! this.codeView || old === nu ) return;
        var nuReadOnly = nu === 'read-only';
        if ( nuReadOnly !== this.codeView.getReadOnly() ) {
          if ( nuReadOnly ) this.applyReadOnlySettings();
          else              this.applyReadWriteSettings();
        }
      }
    },
    {
      model_: 'StringProperty',
      name: 'codeViewLoadState',
      defaultValue: 'pending'
    },
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
      defaultValue: 25
    },
    {
      model_: 'StringProperty',
      name: 'aceReadOnlyTheme',
      defaultValue: 'ace/theme/textmate'
    },
    {
      model_: 'IntProperty',
      name: 'aceReadOnlyMinLines',
      defaultValue: 1
    },
    {
      model_: 'IntProperty',
      name: 'aceReadOnlyMaxLines',
      defaultValue: 3
    },
    {
      name: 'codeView'
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        debugger;
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
    },
    {
      name: 'applyReadOnlySettings',
      code: function() {
        this.codeView.setOptions({
          theme: this.aceTheme,
          mode: this.aceMode,
          tabSize: this.aceTabSize,
          minLines: this.aceMinLines,
          maxLines: this.aceMaxLines,
          readOnly: this.mode === 'read-only'
        });
      }
    },
    {
      name: 'applyReadWriteSettings',
      code: function() {
        this.codeView.setOptions({
          theme: this.aceTheme,
          mode: this.aceMode,
          tabSize: this.aceTabSize,
          minLines: this.aceMinLines,
          maxLines: this.aceMaxLines,
          readOnly: this.mode === 'read-only'
        });
      }
    }
  ],

  listeners: [
    {
      name: 'onAceLoaded',
      code: function() {
        if ( ! this.$ ) return;
        var codeView = this.codeView = GLOBAL.ace.edit(this.$);

        if ( this.mode === 'read-only' ) this.applyReadOnlySettings();
        else                             this.applyReadWriteSettings();

        codeView.setValue(this.data.code.trim());
        codeView.clearSelection();
        codeView.getSession().on('change', this.onCodeChange);
        this.codeViewLoadState = 'loaded';
      }
    },
    {
      name: 'onAceLoadFailed',
      code: function() {
        this.codeViewLoadState = 'failed';
      }
    },
    {
      name: 'onCodeChange',
      code: function(e) {
        var codeViewCode = this.codeView.getValue();
        if ( codeViewCode !== this.data ) this.data.code = codeViewCode;
      }
    },
    {
      name: 'onLanguageChange',
      code: function() {
        this.codeView.getSession().setMode('ace/mode/' + this.data.language);
      }
    }
  ],

  templates: [
    // Support both <ace-code-view>...</ace-code-view> and %%myAceCodeView.
    function toInnerHTML() {/*
      <% if ( this.inner ) { %><%= this.inner() %><% } else { %><%= this.data.code %><% } %>
    */},
    function CSS() {/*
      ace-code-view {
        display: block;
        font: 14px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        flex-grow: 1;
      }
    */}
  ]
});
