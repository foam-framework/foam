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

  requires: [
    'foam.flow.SourceCode'
  ],
  imports: [
    'document',
    'codeViewLoadState$',
    'aceScript$'
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
        if ( old ) old.language$.removeListener(this.onLanguageChange);
        if ( nu ) nu.language$.addListener(this.onLanguageChange);
        if ( ! old || old.language !== nu.language ) this.onLanguageChange();

        if ( ! this.codeView ) return;

        var codeViewCode = this.codeView.getValue();
        if ( codeViewCode !== nu.code ) {
          this.codeView.setValue(nu.code);
          this.codeView.clearSelection();
        }
      }
    },
    {
      // TODO(markdittmer): Should be able to use foam.ui.ModeProperty here
      // but it doesn't seem to be working.
      model_: 'StringProperty',
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
      defaultValue: 'unloaded'
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
      defaultValue: 'ace/mode/javascript',
      postSet: function(old, nu) {
        if ( ! this.codeView ) return;
        this.codeView.getSession().setMode('ace/mode/' + this.data.language);
      }
    },
    {
      model_: 'IntProperty',
      name: 'aceTabSize',
      defaultValue: 2
    },
    {
      model_: 'IntProperty',
      name: 'aceMinLines',
      defaultValue: 5
    },
    {
      model_: 'IntProperty',
      name: 'aceMaxLines',
      defaultValue: 25
    },
    {
      model_: 'StringProperty',
      name: 'aceReadOnlyTheme',
      defaultValue: 'ace/theme/kuroir'
    },
    {
      model_: 'IntProperty',
      name: 'aceReadOnlyMinLines',
      defaultValue: 2
    },
    {
      model_: 'IntProperty',
      name: 'aceReadOnlyMaxLines',
      defaultValue: 25
    },
    {
      name: 'aceScript'
    },
    {
      name: 'codeView'
    },
    {
      model_: 'BooleanProperty',
      name: 'allFolded',
      defaultValue: false
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( this.codeViewLoadState === 'unloaded' ) {
          this.aceScript = this.document.createElement('script');
          this.aceScript.src = this.pathToAce;
          this.document.head.appendChild(this.aceScript);
          this.codeViewLoadState = 'pending';
        }
        if ( this.codeViewLoadState === 'pending' ) {
          this.aceScript.addEventListener('load', this.onAceLoaded);
          this.aceScript.addEventListener('error', this.onAceLoadFailed);
        }
        if ( this.codeViewLoadState === 'loaded' ) this.onAceLoaded();
        if ( this.codeViewLoadState === 'failed' ) this.onAceLoadFailed();
      }
    },
    {
      name: 'destroy',
      code: function() {
        if ( this.codeViewLoadState === 'pending' )
          this.removeDOMListeners_();
        this.SUPER.apply(this, arguments);
      }
    },
    {
      name: 'removeDOMListeners_',
      code: function() {
        this.aceScript.removeEventListener('load', this.onAceLoaded);
        this.aceScript.removeEventListener('error', this.onAceLoadFailed);
      }
    },
    {
      name: 'applyReadOnlySettings',
      code: function() {
        this.codeView.setOptions({
          theme: this.aceReadOnlyTheme,
          mode: this.aceMode,
          tabSize: this.aceTabSize,
          minLines: this.aceReadOnlyMinLines,
          maxLines: this.aceReadOnlyMaxLines,
          readOnly: this.mode === 'read-only'
        });
        this.foldAll();
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
        this.unfoldAll();
      }
    },
    {
      name: 'foldAll',
      code: function() {
        if ( ! this.codeView || this.allFolded ) return;

        this.codeView.selectAll();
        this.codeView.getSession().toggleFold();
        this.codeView.clearSelection();

        this.allFolded = true;
      }
    },
    {
      name: 'unfoldAll',
      code: function(tryToUnfold) {
        if ( ! this.codeView || ! this.allFolded ) return;

        this.codeView.selectAll();
        this.codeView.getSession().toggleFold();
        this.codeView.clearSelection();

        this.allFolded = false;
      }
    }
  ],

  listeners: [
    {
      name: 'onAceLoaded',
      code: function() {
        this.removeDOMListeners_();
        if ( ! this.$ ) return;
        var codeView = this.codeView = GLOBAL.ace.edit(this.$);

        codeView.setValue(this.data && this.data.code && this.data.code.trim() || '');

        if ( this.mode === 'read-only' ) this.applyReadOnlySettings();
        else                             this.applyReadWriteSettings();

        codeView.clearSelection();

        var session = codeView.getSession();
        session.on('changeFold', this.onChangeFold);
        session.on('change', this.onCodeChange);
        this.codeViewLoadState = 'loaded';
      }
    },
    {
      name: 'onAceLoadFailed',
      code: function() {
        this.removeDOMListeners_();
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
        this.aceMode = 'ace/mode/' + this.data.language;
      }
    },
    {
      name: 'onChangeFold',
      code: function() {
        if ( this.mode !== 'read-only' ) return;
        this.allFolded = false;
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
