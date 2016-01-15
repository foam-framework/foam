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
  extends: 'foam.flow.Element',

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
        if ( old ) {
          old.language$.removeListener(this.onLanguageChange);
          old.code$.removeListener(this.onDataCodeChange);
        }
        if ( nu ) {
          nu.language$.addListener(this.onLanguageChange);
          nu.code$.addListener(this.onDataCodeChange);
        }
        this.onLanguageChange();
        this.onDataCodeChange();
      }
    },
    {
      // TODO(markdittmer): Should be able to use foam.ui.ModeProperty here
      // but it doesn't seem to be working.
      type: 'String',
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
      type: 'String',
      name: 'codeViewLoadState',
      defaultValue: 'unloaded'
    },
    {
      type: 'String',
      name: 'pathToAce',
      defaultValue: 'ace-builds/src-noconflict/ace.js'
    },
    {
      type: 'String',
      name: 'aceTheme',
      defaultValue: 'ace/theme/textmate'
    },
    {
      type: 'String',
      name: 'aceMode',
      defaultValue: 'ace/mode/javascript',
      postSet: function(old, nu) {
        if ( ! this.codeView ) return;
        this.codeView.getSession().setMode('ace/mode/' + this.data.language);
      }
    },
    {
      type: 'Int',
      name: 'aceTabSize',
      defaultValue: 2
    },
    {
      type: 'Int',
      name: 'aceMinLines',
      defaultValue: 5
    },
    {
      type: 'Int',
      name: 'aceMaxLines',
      defaultValue: 25
    },
    {
      type: 'String',
      name: 'aceReadOnlyTheme',
      defaultValue: 'ace/theme/kuroir'
    },
    {
      type: 'Int',
      name: 'aceReadOnlyMinLines',
      defaultValue: 2
    },
    {
      type: 'Int',
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
      type: 'Boolean',
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
          readOnly: this.mode === 'read-only',
          useWorker: false
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
          readOnly: this.mode === 'read-only',
          useWorker: false
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

        // Suppress warning from ace.js:3460.
        codeView.$blockScrolling = Infinity;

        codeView.setValue(this.data && this.data.code && this.data.code.trim() || '');

        if ( this.mode === 'read-only' ) this.applyReadOnlySettings();
        else                             this.applyReadWriteSettings();

        codeView.clearSelection();

        var session = codeView.getSession();
        session.on('changeFold', this.onChangeFold);
        session.on('change', this.onAceCodeChange);
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
      name: 'onAceCodeChange',
      isFramed: true,
      code: function(e) {
        if ( ! this.codeView || ! this.data ) return;
        var codeViewCode = this.codeView.getValue();
        if ( codeViewCode !== this.data.code ) this.data.code = codeViewCode;
      }
    },
    {
      name: 'onDataCodeChange',
      isFramed: true,
      code: function(e) {
        if ( ! this.codeView || ! this.data ) return;
        var codeViewCode = this.codeView.getValue();
        if ( codeViewCode !== this.data.code ) {
          this.codeView.setValue(this.data.code);
          this.codeView.clearSelection();

          // Value changes will unfold code; re-fold read-only view. Note that
          // this may be a change if user manually unfolded some code, but kept
          // it read-only. Also, any folds in read-write views will get unfolded
          // without correct. Unfortuantely, using mode as a guess at what we
          // should do is all we've got.
          if ( this.mode === 'read-only'  ) this.foldAll();
        }
      }
    },
    {
      name: 'onLanguageChange',
      code: function() {
        if ( ! this.data ) return;
        var aceMode = 'ace/mode/' + this.data.language;
        if ( this.aceMode !== aceMode ) this.aceMode = aceMode;
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
